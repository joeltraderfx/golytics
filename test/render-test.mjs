import { JSDOM } from "jsdom";
import fs from "fs";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.HTMLElement = dom.window.HTMLElement;
global.MutationObserver = dom.window.MutationObserver;
global.customElements = dom.window.customElements;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = dom.window.requestAnimationFrame || ((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = dom.window.cancelAnimationFrame || clearTimeout;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.SVGElement = dom.window.SVGElement;
global.DocumentFragment = dom.window.DocumentFragment;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;

const mockTeams = {
  data: [
    { id: 275, name: "Palmeiras", shortName: "PAL", games: 13, goalsFor: 23, goalsAgainst: 10, points: 32, position: 1, wins: 10, draws: 2, losses: 1, recentForm: ["W","W","D","W","W"] },
    { id: 131, name: "Corinthians", shortName: "COR", games: 14, goalsFor: 9, goalsAgainst: 10, points: 15, position: 12, wins: 3, draws: 6, losses: 5, recentForm: ["L","D","W","L","D"] },
  ],
  fromCache: false, stale: false,
};
const mockRounds = {
  data: [
    { id: 1, round: 19, dateTime: "2026-07-21T21:30:00", date: "2026-07-21", time: "21:30", venue: "Allianz Parque", status: "scheduled",
      homeTeam: { id: 275, name: "Palmeiras", shortName: "PAL" }, awayTeam: { id: 131, name: "Corinthians", shortName: "COR" } },
  ],
  fromCache: false, stale: false,
};

global.fetch = async (url) => {
  const u = String(url);
  if (u.includes("/api/teams")) return { ok: true, json: async () => mockTeams };
  if (u.includes("/api/rounds")) return { ok: true, json: async () => mockRounds };
  throw new Error("URL não mockada: " + u);
};

const React = (await import("react")).default;
const { createRoot } = await import("react-dom/client");

const bundlePath = fs.readdirSync("dist/assets").find((f) => f.endsWith(".js"));
await import(`../dist/assets/${bundlePath}`);
// O bundle já auto-executa createRoot(...).render(<App/>) via main.tsx, então
// não precisamos chamar render manualmente aqui.

// espera os efeitos assíncronos (fetch + setState) resolverem
await new Promise((r) => setTimeout(r, 300));

const text = document.body.textContent;

const checks = [
  ["Nome do time mandante aparece", text.includes("Palmeiras")],
  ["Nome do time visitante aparece", text.includes("Corinthians")],
  ["Nenhum erro de API é mostrado (dados mockados funcionaram)", !text.includes("Não foi possível")],
  ["Rodada correta é exibida", text.includes("19")],
  ["Rótulo da marca aparece", text.includes("GOLYTICS")],
  ["Texto de carregamento SUMIU depois dos dados chegarem", !text.includes("Carregando dados reais")],
];

let failures = 0;
for (const [name, ok] of checks) {
  console.log(ok ? `✅ ${name}` : `❌ ${name}`);
  if (!ok) failures++;
}

// Testa clique num card pra abrir o modal de análise
const cards = document.querySelectorAll("[class*='cursor-pointer']");
console.log(`\nCards de jogo encontrados no DOM: ${cards.length}`);
if (cards.length > 0) {
  cards[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 100));
  const modalOpened = document.body.textContent.includes("Análise Preditiva");
  console.log(modalOpened ? "✅ Modal de análise abre ao clicar no card" : "❌ Modal não abriu ao clicar");
  if (!modalOpened) failures++;
} else {
  console.log("❌ Nenhum card encontrado pra testar o clique");
  failures++;
}

console.log(failures === 0 ? "\n🎉 Renderização real validada com sucesso." : `\n${failures} verificação(ões) falharam.`);
process.exit(failures === 0 ? 0 : 1);
