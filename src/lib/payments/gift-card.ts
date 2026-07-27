import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const secret =
    process.env.GIFT_CARD_ENCRYPTION_KEY ||
    process.env.BETTER_AUTH_SECRET ||
    "ariszay-dev-gift-card-key-change-me";
  return createHash("sha256").update(secret).digest();
}

/** Encrypt a gift card code for at-rest storage. */
export function encryptGiftCardCode(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

/** Decrypt a stored gift card code. OWNER/ADMIN only — call sites must enforce RBAC. */
export function decryptGiftCardCode(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload");
  }
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/** Normalize gift card input (trim, upper, keep alphanumerics and dashes). */
export function normalizeGiftCardCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-");
}

/** Last 4 characters of the code (alphanumeric only). */
export function giftCardLast4(code: string): string {
  const alnum = code.replace(/[^A-Z0-9]/gi, "");
  return alnum.slice(-4).toUpperCase() || "????";
}

/** Mask for customers / support agents: XXXX-XXXX-XXXX-1234 */
export function maskGiftCardCode(last4: string): string {
  const safe = (last4 || "????").slice(-4).toUpperCase().padStart(4, "?");
  return `XXXX-XXXX-XXXX-${safe}`;
}
