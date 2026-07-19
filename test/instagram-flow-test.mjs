import assert from "node:assert/strict";

let step = 0;
let statusSequence = ["IN_PROGRESS", "IN_PROGRESS", "FINISHED"];
let statusCallCount = 0;

global.fetch = async (url, opts) => {
  const u = String(url);

  if (u.includes("/media") && !u.includes("media_publish") && opts?.method === "POST") {
    const body = JSON.parse(opts.body);
    assert.equal(body.image_url, "https://joeltraderfx.github.io/golytics/posts/teste.png");
    assert.ok(body.caption.includes("Golytics"));
    return { ok: true, json: async () => ({ id: "CREATION_ID_123" }) };
  }

  if (u.includes("/media_publish") && opts?.method === "POST") {
    const body = JSON.parse(opts.body);
    assert.equal(body.creation_id, "CREATION_ID_123");
    return { ok: true, json: async () => ({ id: "PUBLISHED_POST_456" }) };
  }

  if (u.includes("CREATION_ID_123") && (!opts || opts.method === undefined)) {
    const status = statusSequence[Math.min(statusCallCount, statusSequence.length - 1)];
    statusCallCount++;
    return { ok: true, json: async () => ({ status_code: status }) };
  }

  throw new Error("Chamada não mockada: " + u);
};

process.env.IG_ACCESS_TOKEN = "fake-token";
process.env.IG_BUSINESS_ACCOUNT_ID = "17841400000000000";
process.env.IMAGE_PUBLIC_URL = "https://joeltraderfx.github.io/golytics/posts/teste.png";
process.env.POST_CAPTION = "Previsões de hoje no Golytics! 📊";

// Reduz os tempos de espera pro teste não demorar
const mod = await import("../scripts/social/post-to-instagram.mjs");
