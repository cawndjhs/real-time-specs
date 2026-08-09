import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Glasses, Ruler, ShieldCheck, Sparkles, Truck } from "lucide-react";

import heroImg from "@/assets/hero-provador.jpg";
import { Button } from "@/components/ui/button";
import { frames, brl } from "@/lib/optica-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vísio — a primeira ótica 100% online do Brasil" },
      {
        name: "description",
        content:
          "Escolha a armação, selecione a lente Kodak, Eyezen ou Varilux e prove em tempo real pela câmera. Tudo online, em 4 etapas.",
      },
      { property: "og:title", content: "Vísio — ótica 100% online com provador virtual" },
      {
        property: "og:description",
        content:
          "Armação, lente e prova em tempo real no seu rosto. Monte seu óculos em 4 etapas guiadas.",
      },
    ],
  }),
  component: Home,
});

const passos = [
  {
    icone: Glasses,
    titulo: "Finalidade",
    texto: "Solar ou de grau: o fluxo se adapta ao que você precisa.",
  },
  {
    icone: Camera,
    titulo: "Armação + provador",
    texto: "Filtre por estilo, cor e formato e prove na hora pela câmera.",
  },
  {
    icone: Ruler,
    titulo: "Lentes e medidas",
    texto: "Visão simples ou multifocal, com DP e centro óptico registrados.",
  },
  {
    icone: Sparkles,
    titulo: "Prova final",
    texto: "Veja armação e lente juntas antes de finalizar o pedido.",
  },
];

function Home() {
  const destaques = frames.slice(0, 3);

  return (
    <div>
      <section className="gradient-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              <Sparkles className="size-3.5" aria-hidden />
              provador em tempo real
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] md:text-5xl">
              A primeira ótica 100% online do Brasil onde você escolhe armação, lente e prova em
              tempo real
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Nada de fila, nada de sair de casa. Monte seu óculos em quatro etapas guiadas, com
              medições técnicas e simulação no seu rosto pela câmera.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-base">
                <Link to="/montar">Começar a escolher meu óculos</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Marcas de lente</dt>
                <dd className="font-display text-lg font-semibold">Kodak · Eyezen · Varilux</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Etapas guiadas</dt>
                <dd className="font-display text-lg font-semibold">4</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Garantia</dt>
                <dd className="font-display text-lg font-semibold">90 dias</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="Cliente experimentando óculos pelo provador virtual da Vísio"
              width={1280}
              height={1024}
              className="w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold md:text-3xl">Como funciona</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {passos.map((p, i) => (
            <li
              key={p.titulo}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <p.icone className="size-5" aria-hidden />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Etapa {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{p.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold md:text-3xl">Armações em destaque</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Prove qualquer modelo direto no seu rosto.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 rounded-full">
              <Link to="/montar">Ver catálogo</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((f) => (
              <article
                key={f.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <img
                  src={f.imagem}
                  alt={`Armação ${f.nome}`}
                  loading="lazy"
                  width={1024}
                  height={512}
                  className="h-32 w-full object-contain"
                />
                <h3 className="mt-4 text-lg font-semibold">{f.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {f.formato} · {f.cor} · {f.material}
                </p>
                <p className="mt-3 font-display text-xl font-semibold text-brand">{brl(f.preco)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icone: ShieldCheck,
              titulo: "Conferência óptica humana",
              texto: "Um especialista revisa suas medidas antes da montagem.",
            },
            {
              icone: Truck,
              titulo: "Entrega em todo o Brasil",
              texto: "Frete grátis acima de R$ 399 e rastreio em tempo real.",
            },
            {
              icone: Camera,
              titulo: "Provou e não gostou?",
              texto: "Troca da armação em até 30 dias, sem burocracia.",
            },
          ].map((b) => (
            <div key={b.titulo} className="rounded-2xl bg-brand-soft/70 p-5">
              <b.icone className="size-5 text-brand" aria-hidden />
              <h3 className="mt-3 text-base font-semibold">{b.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
