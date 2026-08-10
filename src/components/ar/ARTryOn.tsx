import { ArrowRight, Camera, Download, Loader2, RotateCcw, Ruler, ScanFace } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  calcularGeometria,
  criarFaceTracker,
  type FaceTracker,
  type GeometriaOptica,
} from "@/lib/ar/face-tracker";
import type { Finalidade, Frame, Lente } from "@/lib/optica-data";

export type MedidasAR = {
  dpBinocular: string;
  dpDireita: string;
  dpEsquerda: string;
  centroOptico: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frame: Frame | null;
  finalidade: Finalidade;
  lente?: Lente | null;
  onConfirmar?: (medidas: MedidasAR) => void;
  onMedidasChange?: (medidas: MedidasAR) => void;
};

type Estado = "idle" | "camera" | "modelo" | "pronto" | "erro";

const mm = (v: number) => v.toFixed(1);

export function ARTryOn({
  open,
  onOpenChange,
  frame,
  finalidade,
  lente,
  onConfirmar,
  onMedidasChange,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<FaceTracker | null>(null);
  const rafRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const geoRef = useRef<GeometriaOptica | null>(null);

  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [rostoDetectado, setRostoDetectado] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  const [escala, setEscala] = useState(100);
  const [offsetY, setOffsetY] = useState(0);
  const [marcarCO, setMarcarCO] = useState(finalidade === "grau");

  const escalaRef = useRef(escala);
  const offsetRef = useRef(offsetY);
  const marcarRef = useRef(marcarCO);
  escalaRef.current = escala;
  offsetRef.current = offsetY;
  marcarRef.current = marcarCO;

  useEffect(() => {
    setMarcarCO(finalidade === "grau");
  }, [finalidade]);



  const [medidas, setMedidas] = useState<MedidasAR>({
    dpBinocular: "",
    dpDireita: "",
    dpEsquerda: "",
    centroOptico: "",
  });

  const tinta = useMemo(() => {
    if (!lente) return null;
    const t = lente.tratamentos.join(" ").toLowerCase();
    if (t.includes("fotoss")) return "rgba(38,48,74,0.34)";
    if (t.includes("azul")) return "rgba(232,196,96,0.16)";
    return "rgba(214,232,244,0.12)";
  }, [lente]);

  const encerrar = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    trackerRef.current?.close();
    trackerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    geoRef.current = null;
    setRostoDetectado(false);
    setEstado("idle");
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!video || !canvas || !ctx) return;

    if (video.readyState >= 2) {
      const w = video.videoWidth || 720;
      const h = video.videoHeight || 960;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      // vídeo espelhado (efeito espelho)
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();

      let geo: GeometriaOptica | null = null;
      try {
        const lm = trackerRef.current?.detect(video, performance.now());
        if (lm) geo = calcularGeometria(lm, w, h);
      } catch {
        geo = null;
      }

      if (geo) {
        // converte para o espaço espelhado exibido
        const flip = (p: { x: number; y: number }) => ({ x: w - p.x, y: p.y });
        const pupilaA = flip(geo.pupilaEsq);
        const pupilaB = flip(geo.pupilaDir);
        const centro = flip(geo.centro);
        const angulo = Math.atan2(pupilaB.y - pupilaA.y, pupilaB.x - pupilaA.x);
        const dpPx = Math.hypot(pupilaB.x - pupilaA.x, pupilaB.y - pupilaA.y);

        const img = imgRef.current;
        let baseArmacao = centro.y;
        if (img && img.complete && img.naturalWidth) {
          const largura = dpPx * 2.55 * (escalaRef.current / 100);
          const alturaImg = largura * (img.naturalHeight / img.naturalWidth);
          const cy = centro.y + (offsetRef.current / 100) * alturaImg;
          baseArmacao = cy + alturaImg / 2;

          ctx.save();
          ctx.translate(centro.x, cy);
          ctx.rotate(angulo);
          ctx.shadowColor = "rgba(0,0,0,0.35)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 6;
          ctx.drawImage(img, -largura / 2, -alturaImg / 2, largura, alturaImg);
          ctx.restore();

          if (tinta) {
            ctx.save();
            ctx.translate(centro.x, cy);
            ctx.rotate(angulo);
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = tinta;
            ctx.beginPath();
            ctx.ellipse(-largura * 0.24, 0, largura * 0.19, alturaImg * 0.3, 0, 0, Math.PI * 2);
            ctx.ellipse(largura * 0.24, 0, largura * 0.19, alturaImg * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // marcações de medição
        ctx.save();
        ctx.lineWidth = Math.max(2, w / 480);
        ctx.strokeStyle = "rgba(72,214,214,0.95)";
        ctx.fillStyle = "rgba(72,214,214,0.95)";
        for (const p of [pupilaA, pupilaB]) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(3, w / 240), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(pupilaA.x, pupilaA.y);
        ctx.lineTo(pupilaB.x, pupilaB.y);
        ctx.stroke();

        if (marcarRef.current) {
          ctx.setLineDash([8, 8]);
          ctx.strokeStyle = "rgba(255,214,102,0.95)";
          for (const p of [pupilaA, pupilaB]) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, baseArmacao);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(Math.min(pupilaA.x, pupilaB.x) - 20, baseArmacao);
          ctx.lineTo(Math.max(pupilaA.x, pupilaB.x) + 20, baseArmacao);
          ctx.stroke();
        }
        ctx.restore();

        const centroOptico = (baseArmacao - centro.y) / geo.pxPorMm;
        geoRef.current = geo;
        setRostoDetectado(true);
        setMedidas({
          dpBinocular: mm(geo.dpBinocular),
          dpDireita: mm(geo.dpDireita),
          dpEsquerda: mm(geo.dpEsquerda),
          centroOptico: marcarRef.current ? mm(Math.max(0, centroOptico)) : "",
        });
      } else {
        setRostoDetectado(false);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [tinta]);

  const iniciar = useCallback(async () => {
    setErro(null);
    setSnapshot(null);
    setEstado("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setEstado("modelo");
      try {
        trackerRef.current = await criarFaceTracker();
      } catch {
        trackerRef.current = null;
        setErro(
          "Não foi possível carregar o rastreamento facial. Mostrando a câmera com ajuste manual.",
        );
      }
      setEstado("pronto");
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setEstado("erro");
      setErro("Precisamos da sua câmera para o provador AR. Libere a permissão no navegador.");
    }
  }, [loop]);

  useEffect(() => {
    if (!open) {
      encerrar();
      setSnapshot(null);
    }
    return () => encerrar();
  }, [open, encerrar]);

  useEffect(() => {
    if (!frame) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = frame.imagem;
    imgRef.current = img;
  }, [frame]);

  useEffect(() => {
    if (open && rostoDetectado) onMedidasChange?.(medidas);
  }, [open, rostoDetectado, medidas, onMedidasChange]);

  const capturar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSnapshot(canvas.toDataURL("image/png"));
  };

  const carregando = estado === "camera" || estado === "modelo";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none gap-0 overflow-y-auto rounded-none border-0 bg-background p-0 sm:max-w-none">
        <DialogTitle className="sr-only">
          Provador virtual em realidade aumentada{frame ? ` — ${frame.nome}` : ""}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Rastreamento facial em tempo real com medição automática de distância pupilar e centro
          óptico.
        </DialogDescription>

        <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative min-h-[52vh] bg-surface lg:min-h-0">
            <video ref={videoRef} playsInline muted className="hidden" />
            <canvas ref={canvasRef} className="size-full object-cover" />

            {estado === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <ScanFace className="size-10 text-brand" aria-hidden />
                <div>
                  <p className="font-display text-lg font-semibold">Provador AR em tempo real</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Ativamos sua câmera e o rastreamento facial para encaixar a armação{" "}
                    {frame ? frame.nome : "escolhida"} no seu rosto e medir sua DP automaticamente.
                  </p>
                </div>
                <Button size="lg" onClick={iniciar} className="rounded-full">
                  <Camera className="size-4" aria-hidden />
                  Ativar câmera
                </Button>
              </div>
            )}

            {carregando && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur">
                <Loader2 className="size-8 animate-spin text-brand" aria-hidden />
                <p className="text-sm font-medium">
                  {estado === "camera"
                    ? "Conectando à câmera…"
                    : "Renderizando o modelo 3D da armação…"}
                </p>
              </div>
            )}

            {estado === "pronto" && (
              <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <span
                  className={`size-2 rounded-full ${rostoDetectado ? "bg-highlight" : "bg-muted-foreground"}`}
                  aria-hidden
                />
                {rostoDetectado ? "Rosto detectado" : "Centralize seu rosto"}
              </span>
            )}
          </div>

          <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-t border-border p-5 lg:border-l lg:border-t-0">
            <div>
              <p className="font-display text-lg font-semibold">
                {frame?.nome ?? "Selecione uma armação"}
              </p>
              <p className="text-xs text-muted-foreground">
                {frame ? `${frame.marca} · ${frame.material}` : "—"}
              </p>
            </div>

            {erro && <p className="text-xs text-destructive">{erro}</p>}

            <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
              <p className="font-display text-sm font-semibold">Ajuste do encaixe</p>
              <Controle label="Escala" valor={escala} min={60} max={160} onChange={setEscala} />
              <Controle
                label="Altura no rosto"
                valor={offsetY}
                min={-40}
                max={40}
                onChange={setOffsetY}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEscala(100);
                  setOffsetY(0);
                }}
                className="w-full"
              >
                <RotateCcw className="size-4" aria-hidden />
                Reajustar automático
              </Button>
            </div>

            {finalidade === "grau" && (
              <div className="space-y-3 rounded-2xl border border-border bg-brand-soft/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="size-4 text-brand" aria-hidden />
                    <p className="font-display text-sm font-semibold">Medição automática</p>
                  </div>
                  <Switch
                    checked={marcarCO}
                    onCheckedChange={setMarcarCO}
                    aria-label="Marcar centro óptico"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Medida rotulo="DP binocular" valor={medidas.dpBinocular} />
                  <Medida rotulo="Centro óptico" valor={medidas.centroOptico} />
                  <Medida rotulo="DP olho direito" valor={medidas.dpDireita} />
                  <Medida rotulo="DP olho esquerdo" valor={medidas.dpEsquerda} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculado pelos pontos das pupilas, com a íris como referência de escala. Nossa
                  equipe confere tudo antes da montagem.
                </p>
              </div>
            )}

            {snapshot && (
              <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Sua foto de prova</p>
                  <Badge variant="secondary">snapshot</Badge>
                </div>
                <img
                  src={snapshot}
                  alt="Foto capturada durante a prova virtual"
                  className="w-full rounded-xl"
                />
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href={snapshot} download={`visio-${frame?.id ?? "prova"}.png`}>
                    <Download className="size-4" aria-hidden />
                    Baixar foto
                  </a>
                </Button>
              </div>
            )}

            <div className="mt-auto space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={capturar}
                disabled={estado !== "pronto"}
              >
                <Camera className="size-4" aria-hidden />
                Capturar foto
              </Button>
              <Button
                size="lg"
                className="h-13 w-full rounded-full"
                disabled={!frame}
                onClick={() => {
                  onConfirmar?.(medidas);
                  onOpenChange(false);
                }}
              >
                {finalidade === "grau" ? "Confirmar Armação e Ir para Lentes" : "Confirmar Armação"}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Controle({
  label,
  valor,
  min,
  max,
  onChange,
}: {
  label: string;
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{valor}</span>
      </div>
      <Slider
        value={[valor]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? valor)}
        aria-label={label}
      />
    </div>
  );
}

function Medida({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      <p className="font-display text-base font-semibold">{valor ? `${valor} mm` : "—"}</p>
    </div>
  );
}
