export interface TeamStats {
  id: string;
  name: string;
  shortName: string;
  attackStrength: number; // gols marcados por jogo (dado real, calculado)
  defenseWeakness: number; // gols sofridos por jogo (dado real, calculado)
  color: string;
  form: ("W" | "D" | "L")[];
  // Campos extras (reais) usados pela tabela de classificação:
  points: number;
  position: number;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Match {
  id: string;
  homeId: string;
  awayId: string;
  date: string;
  round: number;
  stadium: string;
}

export function getTeamById(teams: TeamStats[], id: string): TeamStats | undefined {
  return teams.find((t) => t.id === id);
}
