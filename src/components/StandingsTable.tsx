import { Trophy } from "lucide-react";
import type { TeamStats } from "@/lib/teamsData";

interface StandingsTableProps {
  teams: TeamStats[];
}

export function StandingsTable({ teams }: StandingsTableProps) {
  const standings = [...teams].sort((a, b) => a.position - b.position || b.points - a.points);

  if (standings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Classificação ainda não carregada.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Classificação</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="text-left p-2 pl-4">#</th>
              <th className="text-left p-2">Time</th>
              <th className="text-center p-2">J</th>
              <th className="text-center p-2 hidden sm:table-cell">V</th>
              <th className="text-center p-2 hidden sm:table-cell">E</th>
              <th className="text-center p-2 hidden sm:table-cell">D</th>
              <th className="text-center p-2 hidden md:table-cell">GP</th>
              <th className="text-center p-2 hidden md:table-cell">GC</th>
              <th className="text-center p-2">SG</th>
              <th className="text-center p-2 pr-4 font-semibold text-primary">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => {
              const goalDiff = team.goalsFor - team.goalsAgainst;
              const isLibertadores = team.position > 0 && team.position <= 6;
              const isSulAmericana = team.position > 6 && team.position <= 12;
              const isRebaixamento = team.position > 16;

              return (
                <tr
                  key={team.id}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-2 pl-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1 h-5 rounded-full ${
                          isLibertadores ? "bg-primary" : isSulAmericana ? "bg-blue-500" : isRebaixamento ? "bg-destructive" : "bg-transparent"
                        }`}
                      />
                      <span className="font-display font-semibold tabular-nums">{team.position || "-"}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: team.color }}
                      >
                        {team.shortName.slice(0, 3)}
                      </div>
                      <span className="font-medium truncate">{team.name}</span>
                    </div>
                  </td>
                  <td className="text-center p-2 tabular-nums">{team.games}</td>
                  <td className="text-center p-2 tabular-nums hidden sm:table-cell">{team.wins}</td>
                  <td className="text-center p-2 tabular-nums hidden sm:table-cell">{team.draws}</td>
                  <td className="text-center p-2 tabular-nums hidden sm:table-cell">{team.losses}</td>
                  <td className="text-center p-2 tabular-nums hidden md:table-cell">{team.goalsFor}</td>
                  <td className="text-center p-2 tabular-nums hidden md:table-cell">{team.goalsAgainst}</td>
                  <td className="text-center p-2 tabular-nums">
                    <span className={goalDiff > 0 ? "text-primary" : goalDiff < 0 ? "text-destructive" : ""}>
                      {goalDiff > 0 ? "+" : ""}{goalDiff}
                    </span>
                  </td>
                  <td className="text-center p-2 pr-4 font-display font-bold tabular-nums text-primary">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 p-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Libertadores</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Sul-Americana</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Rebaixamento</span>
      </div>
    </div>
  );
}
