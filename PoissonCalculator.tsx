import { useState, useMemo } from "react";
import { predictMatch, probToOdds } from "@/lib/poisson";
import { ProbabilityBar } from "./ProbabilityBar";
import { Calculator, Target, Zap, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teams, getTeamById } from "@/lib/teamsData";
import { TeamBadge } from "./TeamBadge";

export function PoissonCalculator() {
  const [homeId, setHomeId] = useState(teams[0].id);
  const [awayId, setAwayId] = useState(teams[1].id);

  const home = getTeamById(homeId)!;
  const away = getTeamById(awayId)!;

  const prediction = useMemo(
    () =>
      predictMatch(
        home.attackStrength,
        home.defenseWeakness,
        away.attackStrength,
        away.defenseWeakness
      ),
    [homeId, awayId]
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Calculadora de Probabilidades</h3>
      </div>

      {/* Seleção de times */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Mandante</label>
          <Select value={homeId} onValueChange={setHomeId}>
            <SelectTrigger className="bg-muted/30 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Visitante</label>
          <Select value={awayId} onValueChange={setAwayId}>
            <SelectTrigger className="bg-muted/30 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Times VS */}
      <div className="flex items-center justify-between gap-4 py-3 mb-3">
        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamBadge name={home.name} shortName={home.shortName} color={home.color} size="md" />
          <span className="text-xs font-display font-semibold text-center">{home.name}</span>
        </div>
        <span className="font-display font-bold text-2xl tabular-nums text-primary">
          {prediction.mostLikelyScore.home} × {prediction.mostLikelyScore.away}
        </span>
        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamBadge name={away.name} shortName={away.shortName} color={away.color} size="md" />
          <span className="text-xs font-display font-semibold text-center">{away.name}</span>
        </div>
      </div>

      {/* Probabilidades */}
      <div className="space-y-3">
        <ProbabilityBar
          homeProb={prediction.homeWinProb}
          drawProb={prediction.drawProb}
          awayProb={prediction.awayWinProb}
        />

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <div className="text-[10px] text-muted-foreground uppercase">Casa</div>
            <div className="text-base font-display font-bold text-primary tabular-nums">{prediction.homeWinProb.toFixed(1)}%</div>
            <div className="text-[10px] text-muted-foreground">Odds {probToOdds(prediction.homeWinProb).toFixed(2)}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <div className="text-[10px] text-muted-foreground uppercase">Empate</div>
            <div className="text-base font-display font-bold tabular-nums">{prediction.drawProb.toFixed(1)}%</div>
            <div className="text-[10px] text-muted-foreground">Odds {probToOdds(prediction.drawProb).toFixed(2)}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <div className="text-[10px] text-muted-foreground uppercase">Fora</div>
            <div className="text-base font-display font-bold text-destructive tabular-nums">{prediction.awayWinProb.toFixed(1)}%</div>
            <div className="text-[10px] text-muted-foreground">Odds {probToOdds(prediction.awayWinProb).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Stats extras */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary shrink-0" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Gols Esp.</div>
            <div className="text-sm font-display font-bold tabular-nums">
              {(prediction.expectedHomeGoals + prediction.expectedAwayGoals).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary shrink-0" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Over 2.5</div>
            <div className="text-sm font-display font-bold tabular-nums text-primary">
              {prediction.over25Prob.toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">BTTS</div>
            <div className="text-sm font-display font-bold tabular-nums text-primary">
              {prediction.bttsProb.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Top placares */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Placares mais prováveis</div>
        <div className="space-y-1.5">
          {prediction.topScores.slice(0, 3).map((score, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="font-display font-bold tabular-nums text-sm w-14">
                {score.home} × {score.away}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${score.probability * 3}%` }}
                />
              </div>
              <span className="text-xs font-display tabular-nums text-primary w-10 text-right">
                {score.probability.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
