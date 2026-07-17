// Times do Brasileirão Série A 2026 com estatísticas (dados fictícios para demo)
export interface TeamStats {
  id: string;
  name: string;
  shortName: string;
  // Estatísticas ofensivas/defensivas (média de gols por jogo)
  attackStrength: number; // força de ataque (gols marcados por jogo)
  defenseWeakness: number; // fragilidade defensiva (gols sofridos por jogo)
  color: string; // cor primária do time
  form: ("W" | "D" | "L")[]; // últimos 5 jogos
}

export const teams: TeamStats[] = [
  { id: "palmeiras", name: "Palmeiras", shortName: "PAL", attackStrength: 1.85, defenseWeakness: 0.72, color: "#006437", form: ["W", "W", "D", "W", "W"] },
  { id: "flamengo", name: "Flamengo", shortName: "FLA", attackStrength: 1.92, defenseWeakness: 0.68, color: "#C8102E", form: ["W", "L", "W", "W", "D"] },
  { id: "botafogo", name: "Botafogo", shortName: "BOT", attackStrength: 1.65, defenseWeakness: 0.85, color: "#000000", form: ["D", "W", "W", "L", "W"] },
  { id: "saopaulo", name: "São Paulo", shortName: "SAO", attackStrength: 1.48, defenseWeakness: 0.92, color: "#FE0000", form: ["L", "D", "W", "D", "W"] },
  { id: "fluminense", name: "Fluminense", shortName: "FLU", attackStrength: 1.38, defenseWeakness: 1.05, color: "#7A0C2E", form: ["D", "L", "D", "W", "L"] },
  { id: "atleticomg", name: "Atlético-MG", shortName: "CAM", attackStrength: 1.55, defenseWeakness: 0.88, color: "#000000", form: ["W", "W", "L", "W", "D"] },
  { id: "cruzeiro", name: "Cruzeiro", shortName: "CRU", attackStrength: 1.42, defenseWeakness: 0.95, color: "#003DA5", form: ["L", "W", "D", "W", "W"] },
  { id: "internacional", name: "Internacional", shortName: "INT", attackStrength: 1.35, defenseWeakness: 1.00, color: "#E30613", form: ["D", "D", "W", "L", "D"] },
  { id: "gremio", name: "Grêmio", shortName: "GRE", attackStrength: 1.40, defenseWeakness: 0.98, color: "#0A61C2", form: ["W", "L", "L", "D", "W"] },
  { id: "corinthians", name: "Corinthians", shortName: "COR", attackStrength: 1.28, defenseWeakness: 1.08, color: "#000000", form: ["L", "D", "W", "L", "D"] },
  { id: "bahia", name: "Bahia", shortName: "BAH", attackStrength: 1.32, defenseWeakness: 1.02, color: "#0061B1", form: ["D", "W", "L", "W", "L"] },
  { id: "fortaleza", name: "Fortaleza", shortName: "FOR", attackStrength: 1.45, defenseWeakness: 0.90, color: "#003DA5", form: ["W", "W", "D", "L", "W"] },
  { id: "vasco", name: "Vasco", shortName: "VAS", attackStrength: 1.22, defenseWeakness: 1.15, color: "#000000", form: ["L", "L", "D", "W", "D"] },
  { id: "atleticogo", name: "Atlético-GO", shortName: "ACG", attackStrength: 1.15, defenseWeakness: 1.25, color: "#E30613", form: ["L", "D", "L", "D", "L"] },
  { id: "cuiaba", name: "Cuiabá", shortName: "CUI", attackStrength: 1.08, defenseWeakness: 1.30, color: "#006437", form: ["L", "L", "D", "L", "W"] },
  { id: "juventude", name: "Juventude", shortName: "JUV", attackStrength: 1.12, defenseWeakness: 1.22, color: "#003DA5", form: ["D", "L", "L", "D", "D"] },
  { id: "bragantino", name: "Bragantino", shortName: "BGT", attackStrength: 1.38, defenseWeakness: 1.00, color: "#E30613", form: ["W", "D", "W", "L", "D"] },
  { id: "vitoria", name: "Vitória", shortName: "VIT", attackStrength: 1.18, defenseWeakness: 1.18, color: "#C8102E", form: ["L", "W", "L", "D", "L"] },
  { id: "criciuma", name: "Criciúma", shortName: "CRI", attackStrength: 1.05, defenseWeakness: 1.35, color: "#000000", form: ["L", "L", "L", "D", "L"] },
  { id: "athletico", name: "Athletico-PR", shortName: "CAP", attackStrength: 1.30, defenseWeakness: 1.05, color: "#C8102E", form: ["D", "W", "L", "W", "D"] },
];

export interface Match {
  id: string;
  homeId: string;
  awayId: string;
  date: string;
  round: number;
  stadium: string;
}

// Rodada atual (dados fictícios)
export const matches: Match[] = [
  { id: "m1", homeId: "palmeiras", awayId: "flamengo", date: "2026-07-18T21:30:00", round: 19, stadium: "Allianz Parque" },
  { id: "m2", homeId: "botafogo", awayId: "saopaulo", date: "2026-07-18T19:00:00", round: 19, stadium: "Nilton Santos" },
  { id: "m3", homeId: "atleticomg", awayId: "cruzeiro", date: "2026-07-19T16:00:00", round: 19, stadium: "Arena MRJ" },
  { id: "m4", homeId: "fluminense", awayId: "vasco", date: "2026-07-19T18:30:00", round: 19, stadium: "Maracanã" },
  { id: "m5", homeId: "internacional", awayId: "gremio", date: "2026-07-19T21:00:00", round: 19, stadium: "Beira-Rio" },
  { id: "m6", homeId: "corinthians", awayId: "bahia", date: "2026-07-20T19:00:00", round: 19, stadium: "Neo Química Arena" },
  { id: "m7", homeId: "fortaleza", awayId: "juventude", date: "2026-07-20T16:00:00", round: 19, stadium: "Castelão" },
  { id: "m8", homeId: "bragantino", awayId: "vitoria", date: "2026-07-20T18:30:00", round: 19, stadium: "Cícero de Souza Marques" },
  { id: "m9", homeId: "athletico", awayId: "criciuma", date: "2026-07-20T21:00:00", round: 19, stadium: "Ligga Arena" },
  { id: "m10", homeId: "atleticogo", awayId: "cuiaba", date: "2026-07-21T20:00:00", round: 19, stadium: "Antônio Accioly" },
];

export function getTeamById(id: string): TeamStats | undefined {
  return teams.find((t) => t.id === id);
}
