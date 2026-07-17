import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TeamBadge } from "./TeamBadge";
import { ProbabilityBar } from "./ProbabilityBar";
import { predictMatch, probToOdds } from "@/lib/poisson";
import { getTeamById, type Match } from "@/lib/teamsData";
import { TrendingUp, Target, Shield, Zap, BarChart3 } from "lucide-react";

interface MatchAnalysisModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FormBadge({ result }: { result: "W" | "D" | "L" }) {
  const colors = {
    W: "bg-primary text-primary-foreground",
    D: "bg-muted-foreground/40 text-foreground",
    L: "bg-destructive text-destructive-foreground",
  };
  const labels = { W: "V", D: "E", L: "D" };
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${colors[result]}`}>
      {labels[result]}
    </span>
  );
}

export function MatchAnalysisModal({ match, open, onOpenChange }: MatchAnalysisModalProps) {
  if (!match) return null;

  const home = getTeamById(match.homeId);
  const away = getTeamById(match.awayId);

  if (!home || !away) return null;

  const prediction = predictMatch(
    home.attackStrength,
    home.defenseWeakness,
    away.attackStrength,
    away.defenseWeakness
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">Análise Preditiva</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {match.stadium} · Rodada {match.round}
          </DialogDescription>
        </DialogHeader>

        {/* Times VS */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge name={home.name} shortName={home.shortName} color={home.color} size="lg" />
            <span className="text-sm font-display font-semibold text-center">{home.name}</span>
            <div className="flex gap-1">
              {home.form.map((f, i) => <FormBadge key={i} result={f} />)}
            </div>
          </div>

          <div className="flex flex-col items-center px-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Placar provável</span>
            <span className="font-display font-bold text-3xl tabular-nums text-primary">
              {prediction.mostLikelyScore.home} × {prediction.mostLikelyScore.away}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {prediction.mostLikelyScore.probability.toFixed(1)}% de probabilidade
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge name={away.name} shortName={away.shortName} color={away.color} size="lg" />
            <span className="text-sm font-display font-semibold text-center">{away.name}</span>
            <div className="flex gap-1">
              {away.form.map((f, i) => <FormBadge key={i} result={f} />)}
            </div>
          </div>
        </div>

        {/* Probabilidades de resultado */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-display font-semibold">
            <BarChart3 className="w-4 h-4 text-primary" />
            Probabilidades de Resultado
          </div>
          <ProbabilityBar
            homeProb={prediction.homeWinProb}
            drawProb={prediction.drawProb}
            awayProb={prediction.awayWinProb}
          />
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center p-2 rounded-lg bg-primary/10">
              <div className="text-[10px] text-muted-foreground uppercase">Vitória {home.shortName}</div>
              <div className="text-lg font-display font-bold text-primary tabular-nums">{prediction.homeWinProb.toFixed(1)}%</div>
              <div className="text-[10px] text-muted-foreground">Odds: {probToOdds(prediction.homeWinProb).toFixed(2)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <div className="text-[10px] text-muted-foreground uppercase">Empate</div>
              <div className="text-lg font-display font-bold tabular-nums">{prediction.drawProb.toFixed(1)}%</div>
              <div className="text-[10px] text-muted-foreground">Odds: {probToOdds(prediction.drawProb).toFixed(2)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-destructive/10">
              <div className="text-[10px] text-muted-foreground uppercase">Vitória {away.shortName}</div>
              <div className="text-lg font-display font-bold text-destructive tabular-nums">{prediction.awayWinProb.toFixed(1)}%</div>
              <div className="text-[10px] text-muted-foreground">Odds: {probToOdds(prediction.awayWinProb).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Gols esperados */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-display font-semibold mb-2">
              <Target className="w-4 h-4 text-primary" />
              Gols Esperados
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{home.shortName}</span>
                <span className="font-display font-bold tabular-nums text-primary">{prediction.expectedHomeGoals.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{away.shortName}</span>
                <span className="font-display font-bold tabular-nums text-primary">{prediction.expectedAwayGoals.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display font-bold tabular-nums">{(prediction.expectedHomeGoals + prediction.expectedAwayGoals).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-display font-semibold mb-2">
              <Zap className="w-4 h-4 text-primary" />
              Mercados de Gols
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Over 2.5</span>
                <span className="font-display font-bold tabular-nums text-primary">{prediction.over25Prob.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Under 2.5</span>
                <span className="font-display font-bold tabular-nums">{prediction.under25Prob.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ambos marcam</span>
                <span className="font-display font-bold tabular-nums text-primary">{prediction.bttsProb.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 placares mais prováveis */}
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-display font-semibold mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            Placares Mais Prováveis
          </div>
          <div className="space-y-2">
            {prediction.topScores.map((score, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}º</span>
                <span className="font-display font-bold tabular-nums text-base w-16">
                  {score.home} × {score.away}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${score.probability * 3}%` }}
                  />
                </div>
                <span className="text-sm font-display tabular-nums text-primary w-12 text-right">
                  {score.probability.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas dos times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-display font-semibold mb-2">
              <Shield className="w-4 h-4" />
              {home.shortName}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ataque</span>
                <span className="font-display tabular-nums">{home.attackStrength.toFixed(2)} gol/jogo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Defesa</span>
                <span className="font-display tabular-nums">{home.defenseWeakness.toFixed(2)} gol/jogo</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-display font-semibold mb-2">
              <Shield className="w-4 h-4" />
              {away.shortName}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ataque</span>
                <span className="font-display tabular-nums">{away.attackStrength.toFixed(2)} gol/jogo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Defesa</span>
                <span className="font-display tabular-nums">{away.defenseWeakness.toFixed(2)} gol/jogo</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-2">
          Análise calculada com Golytics Pro. Dados ilustrativos para fins informativos.
        </p>
      </DialogContent>
    </Dialog>
  );
}
