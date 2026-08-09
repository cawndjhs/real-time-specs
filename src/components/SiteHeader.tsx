import { Link } from "@tanstack/react-router";
import { Eye, Search, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { brl } from "@/lib/optica-data";

export function SiteHeader() {
  const { items, remove, total } = useCart();
  const [busca, setBusca] = useState("");

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl gradient-brand text-brand-foreground">
            <Eye className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold leading-none tracking-tight">
              Vísio
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              ótica 100% online
            </span>
          </span>
        </Link>

        <form
          className="relative order-3 col-span-2 md:order-none md:col-span-1"
          onSubmit={(e) => e.preventDefault()}
          role="search"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar armações, lentes ou marcas"
            aria-label="Buscar produtos"
            className="h-11 rounded-full border-border bg-surface pl-10"
          />
        </form>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative h-11 shrink-0 rounded-full px-4">
              <ShoppingBag className="size-4" aria-hidden />
              <span className="hidden sm:inline">Carrinho</span>
              {items.length > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-highlight text-[11px] font-bold text-highlight-foreground">
                  {items.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Seu carrinho</SheetTitle>
              <SheetDescription>
                Óculos montados sob medida, com lentes já configuradas.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-3 overflow-y-auto px-4">
              {items.length === 0 ? (
                <p className="rounded-xl bg-surface p-4 text-sm text-muted-foreground">
                  Ainda não há óculos aqui. Monte o seu em 4 etapas com o provador em tempo real.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <img
                      src={item.imagem}
                      alt=""
                      loading="lazy"
                      className="size-16 shrink-0 rounded-lg bg-surface object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.titulo}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{item.detalhe}</p>
                      <p className="mt-1 text-sm font-bold text-brand">{brl(item.preco)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${item.titulo}`}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl font-semibold">{brl(total)}</span>
              </div>
              <Button className="w-full" size="lg" disabled={items.length === 0}>
                Ir para o checkout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
