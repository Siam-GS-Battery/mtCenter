import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill in the value.`
    );
  }
  if (/[^\x00-\xFF]/.test(value)) {
    throw new Error(
      `Env var "${name}" contains non-Latin-1 characters at index ${value.search(/[^\x00-\xFF]/)} — check for text accidentally pasted onto the value line in .env`
    );
  }
  return value;
}

export interface AppConfig {
  port: number;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  geminiApiKey: string | undefined;
  manualAdminSecret: string | undefined;
  corsOrigins: string[];
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 4000,
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  geminiApiKey: process.env.GEMINI_API_KEY,
  manualAdminSecret: process.env.MANUAL_ADMIN_SECRET,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
