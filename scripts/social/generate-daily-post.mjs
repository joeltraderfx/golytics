import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { predictMatch } from "./poisson.mjs";
import { getClubColor } from "./clubColors.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fonte embutida no repositório (não depende do que está instalado na máquina
// que roda o script — garante visual idêntico local e no GitHub Actions)
GlobalFonts.registerFromPath(path.join(__dirname, "fonts/Inter-Regular.ttf"), "Inter");
const FONT = "Inter";

const API_BASE = process.env.PRERENDER_API_BASE || "https://placar-backend-v0kj.onrender.com";
const OUT_DIR = process.env.POST_OUT_DIR || path.join(__dirname, "../../posts");
const MAX_GAMES = 4; // limite de jogos por imagem, pra não ficar gigante

// Paleta (mesma do site)
const COLORS = {
  bg: "#0a0d10",
  panel: "#14171b",
  line: "#23272d",
  text: "#eef0f2",
  muted: "#8b929c",
  accent: "#5eead4",
  gold: "#f5c451",
};

function shortName(name) {
  return name.length > 12 ? name.slice(0, 3).toUpperCase() : name;
}

async function fetchJson(pathName) {
  const res = await fetch(`${API_BASE}${pathName}`);
  if (!res.ok) throw new Error(`Falha ao buscar ${pathName}: HTTP ${res.status}`);
  return res.json();
}

function isToday(dateTimeStr) {
  const d = new Date(dateTimeStr);
  const now = new Date();
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBadge(ctx, x, y, radius, color, initials) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${radius * 0.75}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials.slice(0, 3).toUpperCase(), x, y + 2);
  ctx.restore();
}

async function main() {
  const [teamsRes, roundsRes] = await Promise.all([
    fetchJson("/api/teams"),
    fetchJson("/api/rounds"),
  ]);

  const teams = teamsRes.data || [];
  const teamsById = new Map(teams.map((t) => [String(t.id), t]));
  const allMatches = roundsRes.data || [];

  let todayMatches = allMatches.filter((m) => isToday(m.dateTime));
  if (todayMatches.length === 0) {
    // Sem jogos hoje: usa os próximos jogos mais próximos, pra sempre ter conteúdo pra postar
    todayMatches = allMatches.slice(0, MAX_GAMES);
    console.log("Nenhum jogo hoje — usando os próximos jogos da rodada.");
  }
  const matches = todayMatches.slice(0, MAX_GAMES);

  if (matches.length === 0) {
    console.log("Nenhum jogo disponível pra gerar post. Encerrando sem gerar imagem.");
    return;
  }

  const round = matches[0]?.round;

  // ---- monta as predições de cada jogo ----
  const predictions = matches.map((m) => {
    const home = teamsById.get(String(m.homeTeam.id));
    const away = teamsById.get(String(m.awayTeam.id));
    const homeName = home?.name || m.homeTeam.name;
    const awayName = away?.name || m.awayTeam.name;
    const homeGames = home?.games || 1;
    const awayGames = away?.games || 1;
    const homeAttack = (home?.goalsFor || 0) / homeGames;
    const homeDefense = (home?.goalsAgainst || 0) / homeGames;
    const awayAttack = (away?.goalsFor || 0) / awayGames;
    const awayDefense = (away?.goalsAgainst || 0) / awayGames;

    const pred = predictMatch(homeAttack, homeDefense, awayAttack, awayDefense);
    return { match: m, homeName, awayName, pred };
  });

  // ---- desenha a imagem ----
  const width = 1080;
  const cardHeight = 340;
  const headerHeight = 420;
  const footerHeight = 80;
  const height = headerHeight + predictions.length * (cardHeight + 40) + footerHeight;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // fundo
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // grid decorativo sutil
  ctx.strokeStyle = "rgba(94,234,212,0.05)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx < width; gx += 60) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
  }
  for (let gy = 0; gy < height; gy += 60) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
  }

  // glow verde no canto
  const glow = ctx.createRadialGradient(width - 100, 100, 10, width - 100, 100, 400);
  glow.addColorStop(0, "rgba(94,234,212,0.15)");
  glow.addColorStop(1, "rgba(94,234,212,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // logo
  try {
    const logo = await loadImage(path.join(__dirname, "../../public/logo.png"));
    const logoSize = 90;
    ctx.drawImage(logo, width / 2 - logoSize / 2, 40, logoSize, logoSize);
  } catch {
    console.warn("Aviso: não achei o logo.png, seguindo sem ele.");
  }

  // wordmark
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 48px ${FONT}`;
  const wmY = 175;
  ctx.fillText("GOLYTICS", width / 2, wmY);
  ctx.fillStyle = COLORS.muted;
  ctx.font = `14px ${FONT}`;
  ctx.fillText("D A D O S   Q U E   V I R A M   G O L S", width / 2, wmY + 28);

  // headline
  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 52px ${FONT}`;
  wrapText(ctx, "Você já viu a previsão dos jogos de hoje?", width / 2, 270, 900, 58);

  // subtítulo
  ctx.fillStyle = COLORS.accent;
  ctx.font = `28px ${FONT}`;
  const roundLabel = round ? `Rodada ${round} — ${predictions.length} jogo${predictions.length > 1 ? "s" : ""}` : `${predictions.length} jogo${predictions.length > 1 ? "s" : ""}`;
  ctx.fillText(roundLabel, width / 2, 400);

  // cards de jogo
  let cy = headerHeight;
  const cardMargin = 60;
  const cardW = width - cardMargin * 2;

  for (const p of predictions) {
    const cardX = cardMargin;
    ctx.save();
    roundRect(ctx, cardX, cy, cardW, cardHeight, 20);
    ctx.fillStyle = COLORS.panel;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(94,234,212,0.35)";
    ctx.stroke();
    ctx.restore();

    const badgeY = cy + 60;
    const badgeR = 34;

    drawBadge(ctx, cardX + 70, badgeY, badgeR, getClubColor(p.homeName), p.homeName);
    drawBadge(ctx, cardX + cardW - 70, badgeY, badgeR, getClubColor(p.awayName), p.awayName);

    // nomes + placar central
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.text;
    ctx.font = `bold 30px ${FONT}`;
    ctx.fillText(
      `${shortName(p.homeName)}  ${p.pred.mostLikelyScore.home} × ${p.pred.mostLikelyScore.away}  ${shortName(p.awayName)}`,
      cardX + cardW / 2,
      badgeY + 10
    );

    ctx.fillStyle = COLORS.accent;
    ctx.font = `18px ${FONT}`;
    ctx.fillText(
      `Placar mais provável: ${p.pred.mostLikelyScore.probability.toFixed(1)}% de chance`,
      cardX + cardW / 2,
      badgeY + 46
    );

    // caixas casa/empate/fora
    const boxY = cy + 140;
    const boxH = 90;
    const boxGap = 16;
    const boxW = (cardW - 2 * 32 - 2 * boxGap) / 3;
    const boxLabels = [
      { label: "Casa", val: p.pred.homeWinProb },
      { label: "Empate", val: p.pred.drawProb },
      { label: "Fora", val: p.pred.awayWinProb },
    ];
    boxLabels.forEach((b, i) => {
      const bx = cardX + 32 + i * (boxW + boxGap);
      roundRect(ctx, bx, boxY, boxW, boxH, 10);
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = COLORS.muted;
      ctx.font = `16px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText(b.label, bx + boxW / 2, boxY + 28);
      ctx.fillStyle = COLORS.text;
      ctx.font = `bold 30px ${FONT}`;
      ctx.fillText(`${b.val.toFixed(1)}%`, bx + boxW / 2, boxY + 64);
    });

    // gols esperados
    ctx.fillStyle = COLORS.muted;
    ctx.font = `17px ${FONT}`;
    ctx.fillText(
      `Gols Esperados: ${shortName(p.homeName)} ${p.pred.expectedHomeGoals.toFixed(2)} | ${shortName(p.awayName)} ${p.pred.expectedAwayGoals.toFixed(2)} | Total ${(p.pred.expectedHomeGoals + p.pred.expectedAwayGoals).toFixed(2)}`,
      cardX + cardW / 2,
      cy + 270
    );

    cy += cardHeight + 40;
  }

  // rodapé
  ctx.fillStyle = COLORS.muted;
  ctx.font = `16px ${FONT}`;
  ctx.fillText("Estimativa estatística (modelo de Poisson). Não é garantia de resultado.", width / 2, height - 30);

  // ---- salva ----
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const dateStr = new Date().toISOString().slice(0, 10);
  const imgPath = path.join(OUT_DIR, `golytics-${dateStr}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(imgPath, buffer);
  console.log(`Imagem gerada: ${imgPath} (${predictions.length} jogos)`);

  // ---- gera a legenda (caption) pra usar no post ----
  const captionLines = predictions.map(
    (p) => `⚽ ${p.homeName} x ${p.awayName}: ${p.pred.homeWinProb.toFixed(0)}% / ${p.pred.drawProb.toFixed(0)}% / ${p.pred.awayWinProb.toFixed(0)}%`
  );
  const caption = [
    "📊 Previsões de hoje no Golytics!",
    "",
    ...captionLines,
    "",
    "Análise estatística com modelo de Poisson, baseada em dados reais da temporada.",
    "Não é garantia de resultado — é ciência aplicada ao futebol. ⚽📈",
    "",
    "#Brasileirao #Golytics #Futebol #Estatistica",
  ].join("\n");

  fs.writeFileSync(path.join(OUT_DIR, `golytics-${dateStr}.txt`), caption);
  console.log("Legenda gerada.");

  return { imgPath, caption, dateStr };
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

main().catch((err) => {
  console.error("Erro ao gerar post diário:", err);
  process.exit(1);
});
