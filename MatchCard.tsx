import { TeamBadge } from "./TeamBadge";
import { ProbabilityBar } from "./ProbabilityBar";
import { predictMatch, probToOdds } from "@/lib/poisson";
import { getTeamById, type Match } from "@/lib/teamsData";
import { ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
  className?: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const day = days[d.getDay()];
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
}

export function MatchCard({ match, onClick, className }: MatchCardProps) {
  const home = getTeamById(match.homeId);
  const away = getTeamById(match.awayId);

  if (!home || !away) return null;

  const prediction = predictMatch(
    home.attackStrength,
    home.defenseWeakness,
    away.attackStrength,
    away.defenseWeakness
  );

  const topScore = prediction.mostLikelyScore;
  const isHomeWin = prediction.homeWinProb >= prediction.drawProb && prediction.homeWinProb >= prediction.awayWinProb;
  const isAwayWin = prediction.awayWinProb >= prediction.drawProb && prediction.awayWinProb >= prediction.homeWinProb;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-all duration-200",
        "hover:border-primary/40 hover:shadow-[0_0_24px_-4px] hover:shadow-primary/20",
        "active:scale-[0.98]",
        className
      )}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-muted-foreground/30 to-destructive opacity-60" />

      <div className="p-4">
        {/* Header: data e rodada */}
        <div className="flex items-center justify-between mb-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(match.date)}</span>
          </div>
          <span className="font-display font-semibold text-primary/70">R{match.round}</span>
        </div>

        {/* Times */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TeamBadge name={home.name} shortName={home.shortName} color={home.color} size="sm" />
            <span className="text-sm font-medium truncate">{home.name}</span>
          </div>
          <span className="text-xs text-muted-foreground font-display px-1">VS</span>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-sm font-medium truncate text-right">{away.name}</span>
            <TeamBadge name={away.name} shortName={away.shortName} color={away.color} size="sm" />
          </div>
        </div>

        {/* Placar mais provável — destaque principal */}
        <div className="flex items-center justify-center gap-3 mb-3 py-3 bg-gradient-to-r from-primary/5 via-muted/20 to-destructive/5 rounded-lg border border-border/30">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Placar provável</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-display font-bold text-2xl tabular-nums",
                isHomeWin ? "text-primary" : "text-foreground"
              )}>
                {topScore.home}
              </span>
              <span className="text-muted-foreground text-lg">×</span>
              <span className={cn(
                "font-display font-bold text-2xl tabular-nums",
                isAwayWin ? "text-destructive" : "text-foreground"
              )}>
                {topScore.away}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
              {topScore.probability.toFixed(1)}% prob.
            </span>
          </div>
        </div>

        {/* Barra de probabilidade — assinatura visual */}
        <ProbabilityBar
          homeProb={prediction.homeWinProb}
          drawProb={prediction.drawProb}
          awayProb={prediction.awayWinProb}
        />

        {/* Stats extras */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Over 2.5</div>
            <div className="text-sm font-display font-semibold tabular-nums text-primary">
              {prediction.over25Prob.toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">BTTS</div>
            <div className="text-sm font-display font-semibold tabular-nums text-primary">
              {prediction.bttsProb.toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Odds Casa</div>
            <div className="text-sm font-display font-semibold tabular-nums text-primary">
              {probToOdds(prediction.homeWinProb).toFixed(2)}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center mt-3 text-xs text-primary group-hover:text-primary/80 transition-colors">
          <span className="font-medium">Ver análise detalhada</span>
          <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
