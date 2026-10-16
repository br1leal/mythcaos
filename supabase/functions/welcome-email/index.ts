// MythCaos · e-mail de boas-vindas (Supabase Edge Function)
// Disparado por um Database Webhook no INSERT da tabela leads → sai só no primeiro cadastro.
// Secrets (Edge Functions → Secrets): RESEND_API_KEY, WELCOME_HOOK_SECRET, WELCOME_FROM
// Deploy com "Verify JWT" DESLIGADO (a proteção é o header x-hook-secret).

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const HOOK_SECRET = Deno.env.get("WELCOME_HOOK_SECRET") ?? "";
const FROM = Deno.env.get("WELCOME_FROM") ?? "MythCaos <contato@mythcaos.com.br>";
const SITE = "https://mythcaos.com.br";
const LOGO = `${SITE}/assets/email/logo-v2.png`; // logo oficial (Saci), PNG 480px exibido a 240px

// ===== TEXTO (versão curta aprovada pelo Bruno em 16/10/26) =====
const SUBJECT = (n: string) => `${n}, seu lugar na mesa está guardado`;
const PREHEADER = "As lendas ainda estão se arrumando. Você vai saber antes de todo mundo.";
const BODY = (n: string) => [
  `Oi, ${n}!`,
  "Obrigado por entrar na lista de espera do MythCaos. O jogo está em pleno desenvolvimento, atualmente na fase de playtest. Quando tiver novidade de verdade, você fica sabendo primeiro.",
  "Até breve.",
];
const SIGN = `Um abraço,<br>Bruno Leal · criador do MythCaos · jogo 100% brasileiro<br><a href="https://instagram.com/mythcaos" style="color:#e0362a;text-decoration:none">Instagram @mythcaos</a>`;
// =================================================

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function html(nome: string) {
  const F = "'Spectral',Georgia,'Times New Roman',serif";
  const p = BODY(nome).map((t) => `<p style="margin:0 0 18px;font-family:${F};font-size:17px;line-height:1.6;color:#f1e4cf">${t}</p>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
</head><body style="margin:0;background:#120e0b">
<span style="display:none;max-height:0;overflow:hidden">${PREHEADER}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#120e0b"><tr><td align="center" style="padding:32px 16px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 32px"><a href="${SITE}"><img src="${LOGO}" width="240" alt="MythCaos · O Despertar das Lendas" style="display:block;width:240px;max-width:100%;height:auto;border:0;color:#f1e4cf;font:800 28px Arial,sans-serif"></a></td></tr>
<tr><td style="border-top:2px solid #e0362a;padding:28px 0 0">${p}
<p style="margin:28px 0 0;font-family:${F};font-size:15px;line-height:1.5;color:#c9bba5">${SIGN}</p></td></tr>
<tr><td style="padding:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a7f70">Você recebeu este e-mail porque se cadastrou em <a href="${SITE}" style="color:#c9bba5">${SITE.replace("https://", "")}</a>.</td></tr>
</table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (!HOOK_SECRET || req.headers.get("x-hook-secret") !== HOOK_SECRET) return new Response("forbidden", { status: 401 });
  const p = await req.json().catch(() => null);
  if (!p || p.type !== "INSERT" || p.table !== "leads" || !p.record?.email) return new Response("ignored");
  const r = p.record;
  const nome = esc(((r.nome || "").trim().split(/\s+/)[0] || "lenda").slice(0, 40));
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `welcome-${r.user_id}` },
    body: JSON.stringify({ from: FROM, to: [r.email], subject: SUBJECT(nome), html: html(nome) }),
  });
  if (!res.ok) { console.error("resend", res.status, await res.text()); return new Response("send failed", { status: 502 }); }
  return new Response("sent");
});
