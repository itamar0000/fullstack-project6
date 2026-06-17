import bcrypt from "bcryptjs";

// One-off fixups for databases created by older versions of this app. Every step
// is guarded so it is a no-op on an already-current database. Run after the
// schema and seed are in place.
export async function runMigrations(conn, dbName) {
  async function columnExists(tableName, columnName) {
    const [[row]] = await conn.execute(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [dbName, tableName, columnName]
    );
    return Number(row.cnt) > 0;
  }

  // ── users: admin/block flags added after the original release ───────────────
  if (!(await columnExists("users", "is_admin"))) {
    await conn.execute("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0");
  }
  if (!(await columnExists("users", "is_blocked"))) {
    await conn.execute("ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) DEFAULT 0");
  }

  // ── comments: userId column added after the original release ────────────────
  if (!(await columnExists("comments", "userId"))) {
    await conn.execute(
      `ALTER TABLE comments
       ADD COLUMN userId INT NULL AFTER postId,
       ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL`
    );
  }

  // Backfill the new comments.userId from matching users, then from the post owner.
  await conn.execute(`
    UPDATE comments c
    JOIN users u ON c.email = u.email AND c.name = u.name
    SET c.userId = u.id
    WHERE c.userId IS NULL
  `);
  await conn.execute(`
    UPDATE comments c
    JOIN posts p ON c.postId = p.id
    SET c.userId = p.userId
    WHERE c.userId IS NULL
  `);

  // ── Hash any passwords still stored in plaintext (legacy data) ──────────────
  const [plaintextPasswords] = await conn.execute(
    "SELECT user_id, password FROM user_passwords WHERE password NOT LIKE '$2%'"
  );
  for (const row of plaintextPasswords) {
    // bcrypt hashes start with $2*. Anything else here is legacy plaintext.
    const hash = await bcrypt.hash(row.password, 10);
    await conn.execute("UPDATE user_passwords SET password = ? WHERE user_id = ?", [hash, row.user_id]);
  }
  if (plaintextPasswords.length) {
    console.log(`Migrated ${plaintextPasswords.length} plaintext password(s) to bcrypt hashes.`);
  }

  // Some old seed data used users.website as a temporary password slot. Clear it
  // after hashes exist so GET /users only returns profile data.
  const [websiteScrub] = await conn.execute("UPDATE users SET website = '' WHERE website <> ''");
  if (websiteScrub.affectedRows) {
    console.log(`Cleared leaked password value out of website field for ${websiteScrub.affectedRows} user(s).`);
  }

  // ── Ensure an admin account exists ──────────────────────────────────────────
  const [[adminUser]] = await conn.execute("SELECT id FROM users WHERE username = ?", ["admin"]);
  if (!adminUser) {
    const [result] = await conn.execute(
      `INSERT INTO users (name,username,email,phone,website,street,suite,city,zipcode,company_name,company_catchphrase,company_bs,is_admin,is_blocked)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ["System Admin", "admin", "admin@example.com", "", "", "", "", "", "", "Project 6", "", "", 1, 0]
    );
    const hash = await bcrypt.hash("admin123", 10);
    await conn.execute("INSERT INTO user_passwords (user_id, password) VALUES (?,?)", [result.insertId, hash]);
    console.log("Created admin account (username: admin, password: admin123).");
  } else {
    await conn.execute("UPDATE users SET is_admin = 1, is_blocked = 0 WHERE id = ?", [adminUser.id]);
  }
}
