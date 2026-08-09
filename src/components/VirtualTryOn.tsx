import { Camera, CameraOff, Ruler, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import modeloBase from "@/assets/modelo-base.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { Finalidade, Frame, Lente } from "@/lib/optica-data";

export type Medidas = {
  dpBinocular: string;
  dpDireita: string;
  dpEsquerda: string;
  centroOptico: string;
};

export const medidasVazias: Medidas = {
  dpBinocular: "",
  dpDireita: "",
  dpEsquerda: "",
  centroOptico: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frame: Frame | null;
  finalidade: Finalidade;
  lente?: Lente | null;
  medidas?: Medidas;
  onMedidasChange?: (medidas: Medidas) => void;
  modo?: "armacao" | "final";
};

export function VirtualTryOn({
  open,
  onOpenChange,
  frame,
  finalidade,
  lente,
  medidas,
  onMedidasChange,
  modo = "armacao",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camAtiva, setCamAtiva] = useState(false);
  const [erroCam, setErroCam] = useState<string | null>(null);
  const [largura, setLargura] = useState(62);
  const [altura, setAltura] = useState(40);
  const [horizontal, setHorizontal] = useState(50);
  const [mostrarGuia, setMostrarGuia] = useState(false);

  const pararCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamAtiva(false);
  }, []);

  const ligarCamera = useCallback(async () => {
    setErroCam(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamAtiva(true);
    } catch {
      setErroCam(
        "Não conseguimos acessar sua câmera. Libere a permissão no navegador ou use o modelo padrão.",
      );
      setCamAtiva(false);
    }
  }, []);

  useEffect(() => {
    if (!open) pararCamera();
    return () => pararCamera();
  }, [open, pararCamera]);

  const resetar = () => {
    setLargura(62);
    setAltura(40);
    setHorizontal(50);
  };

  const tinta =
    modo === "final" && lente
      ? lente.tratamentos.some((t) => t.toLowerCase().includes("fotoss"))
        ? "oklch(0.35 0.03 250 / 0.35)"
        : lente.tratamentos.some((t) => t.toLowerCase().includes("azul"))
          ? "oklch(0.85 0.08 90 / 0.18)"
          : "oklch(0.9 0.02 220 / 0.12)"
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-5 py-4 text-left">
          <DialogTitle className="font-display text-lg">
            {modo === "final" ? "Prova final em tempo real" : "Provador virtual"}
            {frame ? ` — ${frame.nome}` : ""}
          </DialogTitle>
          <DialogDescription>
            {modo === "final"
              ? "Veja o resultado com a armação e a lente escolhidas antes de fechar o pedido."
              : "Use sua câmera ou o modelo padrão e ajuste a armação até o encaixe ficar natural."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface">
              {camAtiva ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="size-full scale-x-[-1] object-cover"
                />
              ) : (
                <img
                  src={modeloBase}
                  alt="Modelo padrão para simulação de armação"
                  loading="lazy"
                  className="size-full object-cover"
                />
              )}

              {frame && (
                <img
                  src={frame.imagem}
                  alt=""
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${largura}%`,
                    left: `${horizontal}%`,
                    top: `${altura}%`,
                    filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.28))",
                  }}
                />
              )}

              {tinta && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundColor: tinta }}
                  aria-hidden
                />
              )}

              {mostrarGuia && (
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                  <div className="absolute inset-y-0 left-1/2 w-px bg-highlight/80" />
                  <div
                    className="absolute inset-x-6 h-px bg-highlight/80"
                    style={{ top: `${altura}%` }}
                  />
                </div>
              )}

              <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold backdrop-blur">
                {camAtiva ? "Câmera ao vivo" : "Modelo padrão"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {camAtiva ? (
                <Button variant="outline" onClick={pararCamera} className="flex-1">
                  <CameraOff className="size-4" aria-hidden />
                  Parar câmera
                </Button>
              ) : (
                <Button onClick={ligarCamera} className="flex-1">
                  <Camera className="size-4" aria-hidden />
                  Usar minha câmera
                </Button>
              )}
              <Button variant="outline" onClick={resetar}>
                <RotateCcw className="size-4" aria-hidden />
                Reajustar
              </Button>
            </div>

            {erroCam && <p className="mt-2 text-xs text-destructive">{erroCam}</p>}
          </div>

          <div className="space-y-5">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
              <p className="font-display text-sm font-semibold">Ajuste fino da armação</p>
              <AjusteSlider
                label="Largura"
                value={largura}
                min={35}
                max={95}
                onChange={setLargura}
              />
              <AjusteSlider
                label="Altura (olhos)"
                value={altura}
                min={15}
                max={70}
                onChange={setAltura}
              />
              <AjusteSlider
                label="Centralização"
                value={horizontal}
                min={25}
                max={75}
                onChange={setHorizontal}
              />
            </div>

            {finalidade === "grau" && medidas && onMedidasChange && (
              <div className="space-y-3 rounded-2xl border border-border bg-brand-soft/60 p-4">
                <div className="flex items-center gap-2">
                  <Ruler className="size-4 text-brand" aria-hidden />
                  <p className="font-display text-sm font-semibold">Medição técnica</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alinhe os guias com o centro das pupilas e informe as medidas em milímetros. Nossa
                  equipe confere tudo antes da montagem.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarGuia((v) => !v)}
                  className="w-full"
                >
                  {mostrarGuia ? "Ocultar guias de medição" : "Mostrar guias de medição"}
                </Button>

                <div className="space-y-3 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Visão simples — DP
                  </p>
                  <CampoMedida
                    id="dp-binocular"
                    label="DP binocular (mm)"
                    placeholder="ex.: 62"
                    value={medidas.dpBinocular}
                    onChange={(v) => onMedidasChange({ ...medidas, dpBinocular: v })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CampoMedida
                      id="dp-od"
                      label="DP olho direito"
                      placeholder="31"
                      value={medidas.dpDireita}
                      onChange={(v) => onMedidasChange({ ...medidas, dpDireita: v })}
                    />
                    <CampoMedida
                      id="dp-oe"
                      label="DP olho esquerdo"
                      placeholder="31"
                      value={medidas.dpEsquerda}
                      onChange={(v) => onMedidasChange({ ...medidas, dpEsquerda: v })}
                    />
                  </div>

                  <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Multifocal — DP + centro óptico
                  </p>
                  <CampoMedida
                    id="centro-optico"
                    label="Altura da pupila até o fim da armação (mm)"
                    placeholder="ex.: 22"
                    value={medidas.centroOptico}
                    onChange={(v) => onMedidasChange({ ...medidas, centroOptico: v })}
                  />
                </div>
              </div>
            )}

            {modo === "final" && lente && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="font-display text-sm font-semibold">{lente.nome}</p>
                <p className="mt-1 text-xs text-muted-foreground">{lente.descricao}</p>
              </div>
            )}

            <Button className="w-full" size="lg" onClick={() => onOpenChange(false)}>
              {modo === "final" ? "Confirmar visualização" : "Concluir prova"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AjusteSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(vals) => onChange(vals[0] ?? value)}
        aria-label={label}
      />
    </div>
  );
}

function CampoMedida({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-card"
      />
    </div>
  );
}
