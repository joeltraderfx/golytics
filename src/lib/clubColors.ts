// Cores oficiais (uniforme principal) dos clubes da Série A — informação factual pública.
const CLUB_COLORS: Record<string, string> = {
  "Palmeiras": "#006437",
  "Flamengo": "#C8102E",
  "Botafogo": "#000000",
  "São Paulo": "#FE0000",
  "Fluminense": "#7A0C2E",
  "Atlético-MG": "#000000",
  "Atlético Mineiro": "#000000",
  "Cruzeiro": "#003DA5",
  "Internacional": "#E30613",
  "Grêmio": "#0A61C2",
  "Corinthians": "#000000",
  "Bahia": "#0061B1",
  "Fortaleza": "#003DA5",
  "Vasco": "#000000",
  "Vasco da Gama": "#000000",
  "Vitória": "#C8102E",
  "Bragantino": "#E30613",
  "Red Bull Bragantino": "#E30613",
  "Athletico-PR": "#C8102E",
  "Athletico Paranaense": "#C8102E",
  "Santos": "#000000",
  "Mirassol": "#F2A900",
  "Ceará": "#000000",
  "Coritiba": "#00873E",
  "Juventude": "#003DA5",
  "Chapecoense": "#00873E",
  "Remo": "#00873E",
};

// Fallback determinístico: gera uma cor estável a partir do nome, pra qualquer
// time que não esteja no mapa acima (evita quebrar se a fonte mudar nomes).
function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

export function getClubColor(name: string): string {
  return CLUB_COLORS[name] || hashColor(name);
}
