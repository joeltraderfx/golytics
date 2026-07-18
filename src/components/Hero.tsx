interface HeroProps {
  round: number;
  matchCount: number;
}

export function Hero({ round, matchCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border mb-6">
      {/* Background: gradiente (sem foto — mantém o visual sem depender de asset externo) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${"var(--color-primary)"} 1px, transparent 1px), linear-gradient(90deg, ${"var(--color-primary)"} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {round > 0 ? `RODADA ${round}` : "BRASILEIRÃO 2026"}
          </span>
          <span className="text-xs text-muted-foreground">{matchCount} jogos analisados</span>
        </div>

        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-3 max-w-2xl leading-tight">
          Probabilidade não é sorte.
          <br />
          <span className="text-primary text-glow">É matemática.</span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mb-6 leading-relaxed">
          Análise preditiva do Brasileirão com modelo de Poisson. Palpites baseados em dados reais de ataque e defesa — não em achismos.
        </p>

        {/* Stats com barras miniatura — conectando com a linguagem dos cards */}
        <div className="flex flex-wrap gap-6 text-xs">
          <div className="flex flex-col gap-1">
            <span className="font-display font-bold text-2xl text-primary tabular-nums leading-none">Poisson</span>
            <span className="text-muted-foreground">Modelo estatístico</span>
          </div>
          <div className="w-px h-12 bg-border/50 hidden sm:block" />
          <div className="flex flex-col gap-1">
            <span className="font-display font-bold text-2xl text-primary tabular-nums leading-none">20</span>
            <span className="text-muted-foreground">Times analisados</span>
          </div>
          <div className="w-px h-12 bg-border/50 hidden sm:block" />
          <div className="flex flex-col gap-1">
            <span className="font-display font-bold text-2xl text-primary tabular-nums leading-none">Real-time</span>
            <span className="text-muted-foreground">Cálculo instantâneo</span>
          </div>
        </div>
      </div>
    </section>
  );
}
