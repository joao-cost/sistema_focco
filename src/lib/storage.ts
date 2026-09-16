import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Armazenamento de arquivos enviados pelo usuário (hoje: foto de perfil) via
// Cloudflare R2 (API compatível com S3). Preferível a um volume Docker local
// porque não fica preso a um nó específico do Swarm e serve os arquivos
// direto por URL pública, sem passar pelo servidor Next.js.
//
// Sem essas variáveis configuradas, cai pro fallback local em disco (ver
// src/lib/actions/profile.ts) — útil em desenvolvimento sem precisar de
// conta no R2.
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, ""); // sem barra final

export const isR2Configured = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_PUBLIC_URL
);

let client: S3Client | null = null;

function getClient() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
    });
  }
  return client;
}

/** Sobe um arquivo pro R2 e retorna a URL pública dele. */
export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  await getClient().send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

/** Apaga um arquivo do R2 a partir da URL pública dele (extrai a key). Falha silenciosa — não é crítico. */
export async function deleteFromR2ByUrl(url: string) {
  if (!R2_PUBLIC_URL || !url.startsWith(`${R2_PUBLIC_URL}/`)) return;
  const key = url.slice(R2_PUBLIC_URL.length + 1);
  await getClient()
    .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    .catch(() => {});
}
