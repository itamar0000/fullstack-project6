import "dotenv/config";

// Database connection settings.
// Override any of these with environment variables if your MySQL setup differs
// (e.g. set DB_PASSWORD if your root user has a password).
export const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "proj6",
};

export const PORT = Number(process.env.PORT) || 3001;

export const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
