import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

function scrypt(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, storedHex] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !storedHex) return false;

  const stored = Buffer.from(storedHex, "hex");
  const candidate = await scrypt(password, salt);
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}
