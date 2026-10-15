// MythCaos · e-mail de boas-vindas (Supabase Edge Function)
// Disparado por um Database Webhook no INSERT da tabela leads → sai só no primeiro cadastro.
// Secrets (Edge Functions → Secrets): RESEND_API_KEY, WELCOME_HOOK_SECRET, WELCOME_FROM
// Deploy com "Verify JWT" DESLIGADO (a proteção é o header x-hook-secret).

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const HOOK_SECRET = Deno.env.get("WELCOME_HOOK_SECRET") ?? "";
const FROM = Deno.env.get("WELCOME_FROM") ?? "MythCaos <contato@mythcaos.com.br>";
const SITE = "https://mythcaos.vercel.app";

// ===== TEXTO (aguardando aprovação do Bruno) =====
const SUBJECT = (n: string) => `${n}, seu lugar na mesa está guardado`;
const PREHEADER = "As lendas ainda estão se arrumando. Você vai saber antes de todo mundo.";
const BODY = (n: string) => [
  `Oi, ${n}!`,
  "Obrigado por entrar na lista de espera do MythCaos — a corrida em que Saci, Medusa, Thor e companhia disputam quem chega primeiro ao templo.",
  "O jogo está em pleno desenvolvimento, sendo testado mesa a mesa. Quando tiver novidade de verdade, você fica sabendo primeiro, sem enxurrada de e-mails.",
  "Até lá, segura o dado.",
];
const SIGN = "Bruno Leal<br>criador do MythCaos · jogo 100% brasileiro";
// =================================================

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function html(nome: string) {
  const p = BODY(nome).map((t) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#e9e4da">${t}</p>`).join("");
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#141414">
<span style="display:none;max-height:0;overflow:hidden">${PREHEADER}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Arial,Helvetica,sans-serif">
<tr><td style="padding:0 0 24px;font-size:28px;letter-spacing:2px;color:#e9e4da">MYTH<b style="color:#ff6b4a">CAOS</b></td></tr>
<tr><td>${p}<p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#a9a39a">${SIGN}</p></td></tr>
<tr><td style="padding:32px 0 0;font-size:12px;color:#77726b">Você recebeu este e-mail porque se cadastrou em <a href="${SITE}" style="color:#a9a39a">${SITE.replace("https://", "")}</a>.</td></tr>
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
