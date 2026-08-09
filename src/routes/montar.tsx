import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, Check, Glasses, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { VirtualTryOn, medidasVazias, type Medidas } from "@/components/VirtualTryOn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/lib/cart-context";
import {
  brl,
  cores,
  estilos,
  formatos,
  frames,
  lentes,
  type Finalidade,
  type Frame,
  type Lente,
  type TipoVisao,
} from "@/lib/optica-data";

export const Route = createFileRoute("/montar")({
  head: () => ({
    meta: [
      { title: "Monte seu óculos em 4 etapas — Vísio" },
      {
        name: "description",
        content:
          "Assistente guiado: escolha solar ou grau, prove a armação pela câmera, selecione a lente Kodak, Eyezen ou Varilux e confirme o pedido.",
      },
      { property: "og:title", content: "Monte seu óculos em 4 etapas — Vísio" },
      {
        property: "og:description",
        content: "Provador virtual em tempo real, medição de DP e centro óptico e prova final.",
      },
    ],
  }),
  component: Montar,
});

const titulos = [
  "Finalidade do óculos",
  "Armação e provador virtual",
  "Tipo de lente",
  "Confirmação e prova final",
];

function Montar() {
  const { add } = useCart();
  const [etapa, setEtapa] = useState(1);
  const [finalidade, setFinalidade] = useState<Finalidade | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [medidas, setMedidas] = useState<Medidas>(medidasVazias);
  const [visao, setVisao] = useState<TipoVisao | null>(null);
  const [lente, setLente] = useState<Lente | null>(null);
  const [provaAberta, setProvaAberta] = useState(false);
  const [provaFinal, setProvaFinal] = useState(false);

  const [filtroEstilo, setFiltroEstilo] = useState<string | null>(null);
  const [filtroCor, setFiltroCor] = useState<string | null>(null);
  const [filtroFormato, setFiltroFormato] = useState<string | null>(null);

  const catalogo = useMemo(
    () =>
      frames.filter(
        (f) =>
          (!finalidade || f.finalidades.includes(finalidade)) &&
          (!filtroEstilo || f.estilo === filtroEstilo) &&
          (!filtroCor || f.cor === filtroCor) &&
          (!filtroFormato || f.formato === filtroFormato),
      ),
    [finalidade, filtroEstilo, filtroCor, filtroFormato],
  );

  const total = (frame?.preco ?? 0) + (finalidade === "grau" ? (lente?.preco ?? 0) : 0);

  const escolherFinalidade = (f: Finalidade) => {
    setFinalidade(f);
    setFrame(null);
    setLente(null);
    setVisao(null);
    setEtapa(2);
  };

  const avancarArmacao = () => {
    if (!frame) return;
    setEtapa(finalidade === "solar" ? 4 : 3);
  };

  const adicionarAoCarrinho = () => {
    if (!frame) return;
    add({
      id: `${frame.id}-${lente?.id ?? "solar"}-${Date.now()}`,
      titulo: frame.nome,
      detalhe:
        finalidade === "grau"
          ? `${lente?.nome ?? "Lente"} · DP ${medidas.dpBinocular || "a confirmar"} mm`
          : "Óculos solar com lente polarizada",
      preco: total,
      imagem: frame.imagem,
    });
    toast.success("Óculos adicionado ao carrinho", {
      description: "Abra o carrinho para seguir para o checkout.",
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/">
            <ArrowLeft className="size-4" aria-hidden />
            Home
          </Link>
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Etapa {etapa} de 4
        </p>
      </div>

      <div className="mt-4">
        <Progress value={(etapa / 4) * 100} className="h-2" />
        <h1 className="mt-5 text-3xl font-semibold md:text-4xl">{titulos[etapa - 1]}</h1>
      </div>

      {etapa === 1 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <OpcaoGrande
            icone={Sun}
            titulo="Óculos Solar"
            texto="Proteção UV, lentes polarizadas ou espelhadas. Sem receita."
            onClick={() => escolherFinalidade("solar")}
          />
          <OpcaoGrande
            icone={Glasses}
            titulo="Óculos de Grau"
            texto="Visão simples ou multifocal, com medição de DP e centro óptico."
            onClick={() => escolherFinalidade("grau")}
          />
        </div>
      )}

      {etapa === 2 && (
        <div className="mt-8">
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <FiltroLinha
              label="Estilo"
              opcoes={[...estilos]}
              ativo={filtroEstilo}
              onChange={setFiltroEstilo}
            />
            <FiltroLinha
              label="Cor"
              opcoes={[...cores]}
              ativo={filtroCor}
              onChange={setFiltroCor}
            />
            <FiltroLinha
              label="Formato"
              opcoes={[...formatos]}
              ativo={filtroFormato}
              onChange={setFiltroFormato}
            />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalogo.map((f) => (
              <article
                key={f.id}
                className={`rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition ${
                  frame?.id === f.id ? "border-brand ring-2 ring-brand/25" : "border-border"
                }`}
              >
                <img
                  src={f.imagem}
                  alt={`Armação ${f.nome}`}
                  loading="lazy"
                  width={1024}
                  height={512}
                  className="h-28 w-full object-contain"
                />
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">{f.nome}</h2>
                    <p className="text-xs text-muted-foreground">
                      {f.marca} · {f.formato}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {f.cor}
                  </Badge>
                </div>
                <p className="mt-3 font-display text-xl font-semibold text-brand">{brl(f.preco)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setFrame(f);
                      setProvaAberta(true);
                    }}
                  >
                    <Camera className="size-4" aria-hidden />
                    Provar Armação
                  </Button>
                  <Button
                    variant={frame?.id === f.id ? "default" : "outline"}
                    onClick={() => setFrame(f)}
                    aria-label={`Selecionar ${f.nome}`}
                  >
                    {frame?.id === f.id ? <Check className="size-4" aria-hidden /> : "Escolher"}
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {catalogo.length === 0 && (
            <p className="mt-6 rounded-2xl bg-surface p-6 text-sm text-muted-foreground">
              Nenhuma armação com esses filtros. Tente combinar menos opções.
            </p>
          )}

          <NavEtapas
            onVoltar={() => setEtapa(1)}
            onAvancar={avancarArmacao}
            avancarDesabilitado={!frame}
            textoAvancar={finalidade === "solar" ? "Ir para a confirmação" : "Escolher a lente"}
          />
        </div>
      )}

      {etapa === 3 && finalidade === "grau" && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap gap-3">
            {(["simples", "multifocal"] as TipoVisao[]).map((v) => (
              <Button
                key={v}
                variant={visao === v ? "default" : "outline"}
                size="lg"
                className="rounded-full"
                onClick={() => {
                  setVisao(v);
                  setLente(null);
                }}
              >
                {v === "simples" ? "Visão Simples" : "Multifocal"}
              </Button>
            ))}
          </div>

          {visao && (
            <div className="space-y-8">
              {lentes[visao].map((grupo) => (
                <section key={grupo.marca}>
                  <h2 className="text-xl font-semibold">{grupo.marca}</h2>
                  <p className="text-sm text-muted-foreground">
                    {grupo.opcoes.length} opções disponíveis
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {grupo.opcoes.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLente(l)}
                        className={`rounded-2xl border bg-card p-5 text-left shadow-[var(--shadow-card)] transition hover:border-brand ${
                          lente?.id === l.id ? "border-brand ring-2 ring-brand/25" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-base font-semibold">{l.nome}</h3>
                          {lente?.id === l.id && (
                            <Check className="size-5 shrink-0 text-brand" aria-hidden />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{l.descricao}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {l.tratamentos.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[11px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-3 font-display text-lg font-semibold text-brand">
                          {brl(l.preco)}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <NavEtapas
            onVoltar={() => setEtapa(2)}
            onAvancar={() => setEtapa(4)}
            avancarDesabilitado={!lente}
            textoAvancar="Ver resumo do pedido"
          />
        </div>
      )}

      {etapa === 4 && frame && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <img
                src={frame.imagem}
                alt={`Armação ${frame.nome}`}
                loading="lazy"
                width={1024}
                height={512}
                className="h-24 w-40 object-contain"
              />
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">{frame.nome}</h2>
                <p className="text-sm text-muted-foreground">
                  {frame.marca} · {frame.formato} · {frame.cor} · {frame.material}
                </p>
                <p className="mt-1 text-sm font-semibold">{brl(frame.preco)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-display text-base font-semibold">Especificações da lente</h3>
              {finalidade === "solar" ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Lente solar com proteção UV400 já incluída na armação.
                </p>
              ) : (
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <Linha rotulo="Categoria" valor={visao === "simples" ? "Visão simples" : "Multifocal"} />
                  <Linha rotulo="Marca / modelo" valor={lente ? `${lente.marca} — ${lente.nome}` : "—"} />
                  <Linha rotulo="Tratamentos" valor={lente?.tratamentos.join(", ") ?? "—"} />
                  <Linha rotulo="Valor da lente" valor={lente ? brl(lente.preco) : "—"} />
                  <Linha rotulo="DP binocular" valor={medidas.dpBinocular ? `${medidas.dpBinocular} mm` : "a confirmar"} />
                  <Linha
                    rotulo="DP OD / OE"
                    valor={
                      medidas.dpDireita || medidas.dpEsquerda
                        ? `${medidas.dpDireita || "—"} / ${medidas.dpEsquerda || "—"} mm`
                        : "a confirmar"
                    }
                  />
                  <Linha
                    rotulo="Centro óptico"
                    valor={medidas.centroOptico ? `${medidas.centroOptico} mm` : "a confirmar"}
                  />
                </dl>
              )}
            </div>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border border-border bg-brand-soft/60 p-5">
            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">Valor total</span>
              <span className="font-display text-3xl font-semibold">{brl(total)}</span>
            </div>
            <Button
              size="lg"
              className="h-14 w-full rounded-full text-base"
              onClick={() => setProvaFinal(true)}
            >
              <Camera className="size-5" aria-hidden />
              Provar em Tempo Real com Lentes Escolhidas
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={adicionarAoCarrinho}>
              Adicionar ao carrinho
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setEtapa(finalidade === "solar" ? 2 : 3)}
            >
              Voltar e ajustar
            </Button>
          </aside>
        </div>
      )}

      <VirtualTryOn
        open={provaAberta}
        onOpenChange={setProvaAberta}
        frame={frame}
        finalidade={finalidade ?? "solar"}
        medidas={medidas}
        onMedidasChange={setMedidas}
      />
      <VirtualTryOn
        open={provaFinal}
        onOpenChange={setProvaFinal}
        frame={frame}
        finalidade={finalidade ?? "solar"}
        lente={lente}
        modo="final"
      />
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{rotulo}</dt>
      <dd className="font-medium">{valor}</dd>
    </div>
  );
}

function OpcaoGrande({
  icone: Icone,
  titulo,
  texto,
  onClick,
}: {
  icone: typeof Sun;
  titulo: string;
  texto: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-border bg-card p-7 text-left shadow-[var(--shadow-card)] transition hover:border-brand hover:shadow-[var(--shadow-lift)]"
    >
      <span className="grid size-12 place-items-center rounded-2xl gradient-brand text-brand-foreground">
        <Icone className="size-6" aria-hidden />
      </span>
      <h2 className="mt-5 text-2xl font-semibold">{titulo}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-brand">Selecionar →</span>
    </button>
  );
}

function FiltroLinha({
  label,
  opcoes,
  ativo,
  onChange,
}: {
  label: string;
  opcoes: string[];
  ativo: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[80px_minmax(0,1fr)] sm:items-center">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        <Chip ativo={ativo === null} onClick={() => onChange(null)}>
          Todos
        </Chip>
        {opcoes.map((o) => (
          <Chip key={o} ativo={ativo === o} onClick={() => onChange(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        ativo
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-surface text-foreground hover:border-brand/50"
      }`}
    >
      {children}
    </button>
  );
}

function NavEtapas({
  onVoltar,
  onAvancar,
  avancarDesabilitado,
  textoAvancar,
}: {
  onVoltar: () => void;
  onAvancar: () => void;
  avancarDesabilitado: boolean;
  textoAvancar: string;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
      <Button variant="ghost" onClick={onVoltar}>
        <ArrowLeft className="size-4" aria-hidden />
        Voltar
      </Button>
      <Button size="lg" onClick={onAvancar} disabled={avancarDesabilitado} className="rounded-full">
        {textoAvancar}
      </Button>
    </div>
  );
}
