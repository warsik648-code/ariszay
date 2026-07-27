import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

export type SavedUpload = {
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

export async function saveTicketUpload(
  ticketId: string,
  file: File,
): Promise<SavedUpload> {
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("File must be between 1 byte and 5MB");
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Only images (JPEG/PNG/WebP/GIF) and PDF are allowed");
  }

  // Prevent path traversal on ticketId
  if (!/^[a-z0-9]+$/i.test(ticketId)) {
    throw new Error("Invalid ticket");
  }

  const safeName = sanitizeFileName(file.name);
  const key = `${ticketId}/${Date.now()}-${randomBytes(6).toString("hex")}-${safeName}`;
  const abs = path.join(STORAGE_ROOT, key);
  const resolved = path.resolve(abs);
  if (!resolved.startsWith(path.resolve(STORAGE_ROOT))) {
    throw new Error("Invalid storage path");
  }

  await mkdir(path.dirname(resolved), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(resolved, buffer);

  return {
    storageKey: key,
    fileName: safeName,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

export function resolveStoragePath(storageKey: string): string {
  if (storageKey.includes("..") || storageKey.startsWith("/") || storageKey.includes("\\")) {
    throw new Error("Invalid storage key");
  }
  const abs = path.resolve(path.join(STORAGE_ROOT, storageKey));
  if (!abs.startsWith(path.resolve(STORAGE_ROOT))) {
    throw new Error("Invalid storage path");
  }
  return abs;
}
