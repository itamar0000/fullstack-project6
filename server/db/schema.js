// Table definitions (DDL). Each CREATE TABLE IF NOT EXISTS is idempotent, so
// running this against an already-initialized database is a no-op.
export async function createSchema(conn) {
  // Core user profile data. Passwords are deliberately stored in user_passwords
  // instead of this table so public user responses never expose password hashes.
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      name         VARCHAR(255),
      username     VARCHAR(255) UNIQUE NOT NULL,
      email        VARCHAR(255),
      phone        VARCHAR(100),
      website      VARCHAR(255),
      street       VARCHAR(255),
      suite        VARCHAR(255),
      city         VARCHAR(255),
      zipcode      VARCHAR(50),
      company_name VARCHAR(255),
      company_catchphrase TEXT,
      company_bs   TEXT,
      is_admin     TINYINT(1) DEFAULT 0,
      is_blocked   TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Authentication data is split from users and cascades away with the user row.
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS user_passwords (
      user_id  INT PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // App content tables mirror the JSONPlaceholder-style resources used by the UI.
  // Foreign keys keep child records tied to their owning user/post/album.
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id        INT AUTO_INCREMENT PRIMARY KEY,
      userId    INT NOT NULL,
      title     TEXT,
      completed TINYINT(1) DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id     INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title  TEXT,
      body   TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Comments optionally point at a user; deleting a user keeps the comment but
  // clears that relationship so post discussions are not removed unexpectedly.
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id     INT AUTO_INCREMENT PRIMARY KEY,
      postId INT NOT NULL,
      userId INT NULL,
      name   VARCHAR(255),
      email  VARCHAR(255),
      body   TEXT,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      actorId    INT NULL,
      action     VARCHAR(80) NOT NULL,
      targetType VARCHAR(80) NOT NULL,
      targetId   INT NULL,
      details    TEXT,
      createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS albums (
      id     INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title  TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS photos (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      albumId      INT NOT NULL,
      title        TEXT,
      url          VARCHAR(500),
      thumbnailUrl VARCHAR(500),
      FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
