// Publica a imagem gerada no Instagram via Graph API (Meta).
//
// Pré-requisitos (ver README-instagram.md):
//   - Conta Instagram Business/Creator
//   - App no Meta for Developers com produto "Instagram Graph API"
//   - Long-lived access token com permissão instagram_content_publish
//
// Variáveis de ambiente necessárias:
//   IG_ACCESS_TOKEN       - token de acesso de longa duração
//   IG_BUSINESS_ACCOUNT_ID - ID da conta Instagram Business (não é o @usuario)
//   IMAGE_PUBLIC_URL      - URL pública da imagem (hospedada no GitHub Pages)
//   POST_CAPTION          - legenda do post
import fs from "fs";
import path from "path";

const GRAPH_API = "https://graph.facebook.com/v21.0";

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Variável de ambiente obrigatória não configurada: ${name}`);
  return val;
}

async function createMediaContainer({ igUserId, token, imageUrl, caption }) {
  const url = new URL(`${GRAPH_API}/${igUserId}/media`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: token,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Falha ao criar container de mídia: ${JSON.stringify(data)}`);
  }
  return data.id; // creation_id
}

async function publishMedia({ igUserId, token, creationId }) {
  const url = new URL(`${GRAPH_API}/${igUserId}/media_publish`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: token,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Falha ao publicar mídia: ${JSON.stringify(data)}`);
  }
  return data;
}

async function checkContainerStatus({ creationId, token }) {
  // O Instagram processa a imagem de forma assíncrona; espera ficar "FINISHED"
  // antes de tentar publicar (evita erro de "media not ready").
  const url = new URL(`${GRAPH_API}/${creationId}`);
  url.searchParams.set("fields", "status_code");
  url.searchParams.set("access_token", token);
  const res = await fetch(url);
  const data = await res.json();
  return data.status_code; // EXPIRED | ERROR | FINISHED | IN_PROGRESS | PUBLISHED
}

async function waitUntilReady({ creationId, token, timeoutMs = 60000, intervalMs = 3000 }) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await checkContainerStatus({ creationId, token });
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") {
      throw new Error(`Container de mídia falhou no processamento: ${status}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Tempo esgotado esperando o Instagram processar a imagem.");
}

async function main() {
  const token = requireEnv("IG_ACCESS_TOKEN");
  const igUserId = requireEnv("IG_BUSINESS_ACCOUNT_ID");
  const imageUrl = requireEnv("IMAGE_PUBLIC_URL");

  let caption = process.env.POST_CAPTION;
  if (!caption && process.env.CAPTION_FILE && fs.existsSync(process.env.CAPTION_FILE)) {
    caption = fs.readFileSync(process.env.CAPTION_FILE, "utf-8");
  }
  if (!caption) throw new Error("Nenhuma legenda fornecida (POST_CAPTION ou CAPTION_FILE).");

  console.log("Criando container de mídia no Instagram...");
  const creationId = await createMediaContainer({ igUserId, token, imageUrl, caption });
  console.log("Container criado:", creationId);

  console.log("Aguardando o Instagram processar a imagem...");
  await waitUntilReady({ creationId, token });

  console.log("Publicando...");
  const result = await publishMedia({ igUserId, token, creationId });
  console.log("Publicado com sucesso! ID do post:", result.id);
}

main().catch((err) => {
  console.error("Erro ao publicar no Instagram:", err.message);
  process.exit(1);
});
