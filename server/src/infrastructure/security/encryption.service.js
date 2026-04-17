import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = "aes-256-gcm";
const ivLength = 12;

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is missing");
}

const key = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY)
  .digest();

const normalizePhone = (phone) => phone.replace(/\D/g, "");

export const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(String(text), "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  const [ivHex, encrypted, tagHex] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

export const blindIndex = (data) => {
  const normalized = normalizePhone(data);

  return crypto
    .createHmac("sha256", process.env.BLIND_INDEX_KEY)
    .update(normalized)
    .digest("hex");
};
