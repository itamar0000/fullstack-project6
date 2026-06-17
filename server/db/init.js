import mysql from "mysql2/promise";
import { dbConfig } from "../config.js";
import { createSchema } from "./schema.js";
import { seed } from "./seed.js";
import { runMigrations } from "./migrations.js";

// One-time database setup entry point (`npm run init-db`). Connects as the
// configured user without selecting a database so it can create it if missing,
// then runs schema → seed → migrations in order.
const { database, ...serverConfig } = dbConfig;

const conn = await mysql.createConnection({
  ...serverConfig,
  multipleStatements: true,
});

await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await conn.query(`USE \`${database}\``);

await createSchema(conn);
await seed(conn);
await runMigrations(conn, database);

await conn.end();
console.log("Database initialization done.");
