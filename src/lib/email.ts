import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// ---------------------------------------------------------------------------
// Envio de e-mails transacionais via SMTP do Gmail (Senha de App). UNEMAT
// bloqueia SMTP com credenciais institucionais por política de TI — em vez
// disso, usa-se uma conta Gmail pessoal/dedicada com verificação em duas
// etapas ativada + Senha de App (ver README > "E-mail (SMTP Gmail)").
//
// Variáveis ausentes em dev/local não devem travar o app: os e-mails só são
// logados no console nesse caso, em vez de enviados de verdade.
// ---------------------------------------------------------------------------

let transporter: Transporter | null | undefined; // undefined = ainda não inicializado

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  const port = Number(SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 = SSL direto; 587 (padrão) usa STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

const EMAIL_FROM = process.env.EMAIL_FROM || process.env.SMTP_USER || "FOCCO <naoresponda@localhost>";

function getBaseUrl() {
  return (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const t = getTransporter();
  if (!t) {
    console.warn(
      `[email] SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS) — e-mail NÃO enviado. Para: ${opts.to} | Assunto: ${opts.subject}`
    );
    return;
  }

  try {
    await t.sendMail({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    // Não relança — falha de e-mail não deve derrubar a ação principal
    // (criar usuário, registrar aviso). O chamador decide se avisa o usuário.
    console.error(`[email] falha ao enviar para ${opts.to}:`, err);
  }
}

// ---------------------------------------------------------------------------
// Layout base — HTML simples com estilos inline (clientes de e-mail não
// suportam Tailwind/CSS externo), usando as cores oficiais da marca FOCCO.
// ---------------------------------------------------------------------------

function layout(title: string, bodyHtml: string, ctaHref?: string, ctaLabel?: string) {
  return `
  <div style="background:#f4f6f8;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="height:5px;background:linear-gradient(90deg,#6dbe45 0%,#2e86c1 33%,#f39c12 66%,#e91e63 100%);"></div>
      <div style="padding:28px 28px 8px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.05em;color:#2e86c1;text-transform:uppercase;">
          FOCCO — Formação de Células Cooperativas
        </p>
        <h1 style="margin:0 0 16px;font-size:19px;color:#0f1f3a;">${title}</h1>
        <div style="font-size:14px;line-height:1.6;color:#374151;">
          ${bodyHtml}
        </div>
        ${
          ctaHref
            ? `<div style="margin:24px 0 8px;">
                 <a href="${ctaHref}" style="display:inline-block;background:#6dbe45;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:12px;">
                   ${ctaLabel}
                 </a>
               </div>
               <p style="font-size:12px;color:#9ca3af;word-break:break-all;">
                 Ou copie e cole este link no navegador:<br />${ctaHref}
               </p>`
            : ""
        }
      </div>
      <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          UNEMAT — Câmpus Sinop. Se você não esperava este e-mail, pode ignorá-lo com segurança.
        </p>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${getBaseUrl()}/redefinir-senha/${token}`;
  await sendEmail({
    to,
    subject: "Redefinir sua senha — Sistema FOCCO",
    html: layout(
      "Redefinir sua senha",
      `<p>Olá, ${escapeHtml(name)}.</p>
       <p>Recebemos um pedido pra redefinir a senha da sua conta no Sistema FOCCO. Se foi você, clique no botão abaixo — o link expira em 1 hora.</p>
       <p>Se não foi você quem pediu, ignore este e-mail: sua senha continua a mesma.</p>`,
      url,
      "Redefinir senha"
    ),
  });
}

export async function sendWelcomeEmail(to: string, name: string, token: string) {
  const url = `${getBaseUrl()}/redefinir-senha/${token}`;
  await sendEmail({
    to,
    subject: "Bem-vindo(a) ao Sistema FOCCO — defina sua senha",
    html: layout(
      "Bem-vindo(a) ao Sistema FOCCO",
      `<p>Olá, ${escapeHtml(name)}.</p>
       <p>Uma conta foi criada pra você no sistema de gestão do FOCCO (Formação de Células Cooperativas). Clique no botão abaixo pra definir sua senha de acesso — o link expira em 1 hora.</p>
       <p>Seu e-mail de login é: <strong>${escapeHtml(to)}</strong></p>`,
      url,
      "Definir minha senha"
    ),
  });
}

export async function sendAvisoNotificationEmail(
  to: string,
  destinatarioNome: string,
  aviso: { celulaNome: string | null; data: string; horario: string | null; mensagem: string }
) {
  const dataFormatada = new Date(`${aviso.data}T00:00:00`).toLocaleDateString("pt-BR");
  await sendEmail({
    to,
    subject: `Novo aviso${aviso.celulaNome ? ` — ${aviso.celulaNome}` : ""} — ${dataFormatada}`,
    html: layout(
      "Novo aviso temporário",
      `<p>Olá, ${escapeHtml(destinatarioNome)}.</p>
       ${aviso.celulaNome ? `<p><strong>Célula:</strong> ${escapeHtml(aviso.celulaNome)}</p>` : ""}
       <p><strong>Data:</strong> ${dataFormatada}${aviso.horario ? ` às ${escapeHtml(aviso.horario)}` : ""}</p>
       <p style="margin-top:12px;padding:12px 14px;background:#fdebd0;border-radius:10px;color:#c77800;font-weight:500;">
         ${escapeHtml(aviso.mensagem)}
       </p>`,
      `${getBaseUrl()}/avisos`,
      "Ver avisos no sistema"
    ),
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
