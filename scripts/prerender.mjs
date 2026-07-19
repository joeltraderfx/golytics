// Roda ANTES do `vite build` (ver package.json e o workflow do GitHub Actions).
// Busca a tabela e os jogos reais do backend e injeta um HTML estático dentro
// de <div id="root">...</div> no index.html. Isso é puramente para SEO/crawlers:
// o React substitui esse conteúdo assim que carrega no navegador do usuário —
// mas motores de busca que não executam JavaScript (ou demoram pra fazer isso)
// já veem times, pontos e jogos reais imediatamente no HTML puro.
import fs from "fs";

const API_BASE = process.env.PRERENDER_API_BASE || "https://placar-backend-v0kj.onrender.com";
const INDEX_PATH = "index.html";

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Falha ao buscar ${path}: HTTP ${res.status}`);
  return res.json();
}

function renderStandingsHtml(teams) {
  const sorted = [...teams].sort((a, b) => (a.position || 99) - (b.position || 99));
  const rows = sorted
    .map(
      (t) => `<tr>
        <td>${esc(t.position ?? "-")}</td>
        <td>${esc(t.name)}</td>
        <td>${esc(t.games)}</td>
        <td>${esc(t.wins ?? "-")}</td>
        <td>${esc(t.draws ?? "-")}</td>
        <td>${esc(t.losses ?? "-")}</td>
        <td>${esc(t.goalsFor)}</td>
        <td>${esc(t.goalsAgainst)}</td>
        <td>${esc(t.points ?? "-")}</td>
      </tr>`
    )
    .join("\n");

  return `
  <section aria-label="Classificação do Brasileirão Série A 2026">
    <h2>Classificação do Brasileirão Série A 2026</h2>
    <p>Tabela atualizada com pontos, vitórias, empates, derrotas e gols de todos os ${teams.length} times da Série A do Campeonato Brasileiro.</p>
    <table>
      <thead>
        <tr><th>Pos</th><th>Time</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>Pts</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function renderMatchesHtml(matches, teamsById) {
  const items = matches
    .slice(0, 20)
    .map((m) => {
      const home = teamsById.get(String(m.homeTeam.id));
      const away = teamsById.get(String(m.awayTeam.id));
      const homeName = home?.name || m.homeTeam.name;
      const awayName = away?.name || m.awayTeam.name;
      const d = new Date(m.dateTime);
      const dateLabel = isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
      return `<li>Rodada ${esc(m.round)}: <strong>${esc(homeName)} x ${esc(awayName)}</strong> — ${esc(dateLabel)}${m.venue ? ` (${esc(m.venue)})` : ""}. Probabilidade calculada por modelo de Poisson com base em gols reais marcados e sofridos na temporada.</li>`;
    })
    .join("\n");

  return `
  <section aria-label="Próximos jogos do Brasileirão">
    <h2>Próximos Jogos e Probabilidades — Brasileirão 2026</h2>
    <ul>${items}</ul>
  </section>`;
}

async function main() {
  let html = fs.readFileSync(INDEX_PATH, "utf-8");

  try {
    const [teamsRes, roundsRes] = await Promise.all([
      fetchJson("/api/teams"),
      fetchJson("/api/rounds"),
    ]);

    const teams = teamsRes.data || [];
    const matches = roundsRes.data || [];
    const teamsById = new Map(teams.map((t) => [String(t.id), t]));

    const teamNames = teams.map((t) => t.name).join(", ");

    const staticContent = `
    <div id="seo-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;">
      <h1>Golytics — Probabilidades e Análise Preditiva do Brasileirão Série A 2026</h1>
      <p>Análise estatística (modelo de Poisson) de todos os ${teams.length} times do Campeonato Brasileiro Série A: ${esc(teamNames)}. Probabilidades de vitória, empate, derrota, over/under gols e placar mais provável calculadas a partir de dados reais de gols marcados e sofridos na temporada 2026.</p>
      ${renderStandingsHtml(teams)}
      ${renderMatchesHtml(matches, teamsById)}
    </div>`;

    html = html.replace('<div id="root"></div>', `<div id="root">${staticContent}</div>`);
    console.log(`Pré-render: injetado ${teams.length} times e ${matches.length} jogos no index.html`);
  } catch (err) {
    console.warn("Aviso: não foi possível pré-renderizar dados reais (backend pode estar indisponível). Publicando sem o conteúdo estático de SEO desta vez.", err.message);
  }

  fs.writeFileSync(INDEX_PATH, html);
}

main();
