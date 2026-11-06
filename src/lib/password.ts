import bcrypt from "bcryptjs";
import { appConfig } from "@/config/app.config";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, appConfig.auth.bcryptRounds);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
