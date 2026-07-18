import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MatchCard } from "@/components/MatchCard";
import { MatchAnalysisModal } from "@/components/MatchAnalysisModal";
import { PoissonCalculator } from "@/components/PoissonCalculator";
import { StandingsTable } from "@/components/StandingsTable";
import { useBrasileiraoData } from "@/hooks/useBrasileiraoData";
import { getTeamById } from "@/lib/teamsData";
import type { Match } from "@/lib/teamsData";
import { Sparkles, TrendingUp, Target, BarChart3, Activity, AlertTriangle, Loader2 } from "lucide-react";

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

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-sm">
      <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function LoadingNotice() {
  return (
    <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      Carregando dados reais do Brasileirão…
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("palpites");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { teams, matches, loading, teamsError, matchesError, stale, currentRound } = useBrasileiraoData();

  const resolvedMatches = useMemo(
    () =>
      matches
        .map((m) => ({ match: m, home: getTeamById(teams, m.homeId), away: getTeamById(teams, m.awayId) }))
        .filter((x): x is { match: Match; home: NonNullable<typeof x.home>; away: NonNullable<typeof x.away> } =>
          Boolean(x.home && x.away)
        ),
    [matches, teams]
  );

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setModalOpen(true);
  };

  const selectedHome = selectedMatch ? getTeamById(teams, selectedMatch.homeId) || null : null;
  const selectedAway = selectedMatch ? getTeamById(teams, selectedMatch.awayId) || null : null;

  const topPalpites = [...resolvedMatches].slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container flex-1 py-6">
        {/* Hero - sempre visível */}
        <Hero round={currentRound} matchCount={resolvedMatches.length} />

        {stale && (
          <div className="mb-6 text-xs text-center text-muted-foreground px-3 py-2 rounded-lg bg-muted/20 border border-border/40">
            Alguns dados podem estar levemente desatualizados (fonte de dados temporariamente indisponível — mostrando o último dado válido).
          </div>
        )}

        {loading && <LoadingNotice />}

        {/* Conteúdo por aba */}
        {!loading && activeTab === "palpites" && (
          <div className="space-y-8">
            {matchesError && <ErrorNotice message={matchesError} />}
            {!matchesError && resolvedMatches.length > 0 && (
              <>
                <section>
                  <SectionHeader
                    icon={Sparkles}
                    title="Palpites em Destaque"
                    subtitle="Próximos jogos da rodada"
                    rightLabel="Golytics"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {topPalpites.map(({ match, home, away }) => (
                      <MatchCard key={match.id} match={match} home={home} away={away} onClick={() => handleMatchClick(match)} />
                    ))}
                  </div>
                </section>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border/50" />
                  <Activity className="w-4 h-4 text-primary/40" />
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                <section>
                  <SectionHeader
                    icon={BarChart3}
                    title="Todos os Jogos"
                    subtitle={currentRound > 0 ? `Rodada ${currentRound} — Brasileirão Série A` : "Brasileirão Série A"}
                    rightLabel={`${resolvedMatches.length} partidas`}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {resolvedMatches.map(({ match, home, away }) => (
                      <MatchCard key={match.id} match={match} home={home} away={away} onClick={() => handleMatchClick(match)} />
                    ))}
                  </div>
                </section>
              </>
            )}
            {!matchesError && resolvedMatches.length === 0 && (
              <ErrorNotice message="Nenhum jogo futuro encontrado na fonte de dados no momento." />
            )}
          </div>
        )}

        {!loading && activeTab === "jogos" && (
          <section>
            <SectionHeader
              icon={TrendingUp}
              title={currentRound > 0 ? `Jogos da Rodada ${currentRound}` : "Jogos"}
              subtitle="Análise com modelo de Poisson"
              rightLabel={`${resolvedMatches.length} jogos`}
            />
            {matchesError && <ErrorNotice message={matchesError} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {resolvedMatches.map(({ match, home, away }) => (
                <MatchCard key={match.id} match={match} home={home} away={away} onClick={() => handleMatchClick(match)} />
              ))}
            </div>
          </section>
        )}

        {!loading && activeTab === "classificacao" && (
          <section className="space-y-4">
            <SectionHeader
              icon={Target}
              title="Classificação do Brasileirão"
              subtitle="Tabela real — Série A 2026"
            />
            {teamsError && <ErrorNotice message={teamsError} />}
            <StandingsTable teams={teams} />
          </section>
        )}

        {!loading && activeTab === "calculadora" && (
          <section className="max-w-2xl mx-auto space-y-4">
            <SectionHeader
              icon={BarChart3}
              title="Calculadora Golytics"
              subtitle="Selecione dois times para análise preditiva"
            />
            <p className="text-sm text-muted-foreground -mt-2">
              Escolha o mandante e o visitante para calcular probabilidades de resultado, gols e placares mais prováveis com o modelo de Poisson.
            </p>
            {teamsError && <ErrorNotice message={teamsError} />}
            {!teamsError && <PoissonCalculator teams={teams} />}
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
          <p>Estimativas estatísticas baseadas em dados reais. Não é garantia de resultado nem recomendação de aposta.</p>
        </div>
      </footer>

      {/* Modal de análise */}
      <MatchAnalysisModal
        match={selectedMatch}
        home={selectedHome}
        away={selectedAway}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
