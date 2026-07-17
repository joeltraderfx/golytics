import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MatchCard } from "@/components/MatchCard";
import { MatchAnalysisModal } from "@/components/MatchAnalysisModal";
import { PoissonCalculator } from "@/components/PoissonCalculator";
import { StandingsTable } from "@/components/StandingsTable";
import { matches, type Match } from "@/lib/teamsData";
import { Sparkles, TrendingUp, Target, BarChart3, Activity } from "lucide-react";

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  rightLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  rightLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-xl leading-none">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {rightLabel && (
        <span className="text-xs text-muted-foreground font-medium px-3 py-1 rounded-full bg-muted/30 border border-border/50">
          {rightLabel}
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("palpites");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setModalOpen(true);
  };

  // Top palpites (primeiros 4 jogos)
  const topPalpites = [...matches].slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container flex-1 py-6">
        {/* Hero - sempre visível */}
        <Hero round={19} matchCount={matches.length} />

        {/* Conteúdo por aba */}
        {activeTab === "palpites" && (
          <div className="space-y-8">
            {/* Seção de palpites em destaque */}
            <section>
              <SectionHeader
                icon={Sparkles}
                title="Palpites em Destaque"
                subtitle="Maiores probabilidades da rodada"
                rightLabel="Golytics Pro"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {topPalpites.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => handleMatchClick(match)}
                  />
                ))}
              </div>
            </section>

            {/* Separador visual */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border/50" />
              <Activity className="w-4 h-4 text-primary/40" />
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Todos os jogos da rodada */}
            <section>
              <SectionHeader
                icon={BarChart3}
                title="Todos os Jogos"
                subtitle="Rodada 19 — Brasileirão Série A"
                rightLabel={`${matches.length} partidas`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => handleMatchClick(match)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "jogos" && (
          <section>
            <SectionHeader
              icon={TrendingUp}
              title="Jogos da Rodada 19"
              subtitle="Análise com Golytics Pro"
              rightLabel={`${matches.length} jogos`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => handleMatchClick(match)}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "classificacao" && (
          <section className="space-y-4">
            <SectionHeader
              icon={Target}
              title="Classificação do Brasileirão"
              subtitle="Tabela completa — Série A 2026"
            />
            <StandingsTable />
          </section>
        )}

        {activeTab === "calculadora" && (
          <section className="max-w-2xl mx-auto space-y-4">
            <SectionHeader
              icon={BarChart3}
              title="Calculadora Golytics Pro"
              subtitle="Selecione dois times para análise preditiva"
            />
            <p className="text-sm text-muted-foreground -mt-2">
              Escolha o mandante e o visitante para calcular probabilidades de resultado, gols e placares mais práveis com o algoritmo Golytics Pro.
            </p>
            <PoissonCalculator />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm">
              GOL<span className="text-primary">Y</span>TICS
            </span>
            <span>· Dados que viram gols</span>
          </div>
          <p>Análise com Golytics Pro. Conteúdo informativo.</p>
        </div>
      </footer>

      {/* Modal de análise */}
      <MatchAnalysisModal
        match={selectedMatch}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
