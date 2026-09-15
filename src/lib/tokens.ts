import "server-only";
import { randomBytes, createHash } from "crypto";

/** Gera um token aleatório (texto puro — vai no link do e-mail, nunca no banco). */
export function generateToken() {
  return randomBytes(32).toString("hex");
}

/** Hash determinístico do token (o que de fato é gravado em password_reset_tokens.token_hash). */
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
