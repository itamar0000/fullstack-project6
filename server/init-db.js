import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { dbConfig } from "./config.js";

// Connect without selecting a database so we can create it if missing.
const { database, ...serverConfig } = dbConfig;

// The root connection is used for one-time setup work: create the database,
// select it, create any missing tables, run migrations, and seed initial rows.
const ROOT = await mysql.createConnection({
  ...serverConfig,
  multipleStatements: true,
});

await ROOT.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await ROOT.query(`USE \`${database}\``);

async function columnExists(tableName, columnName) {
  const [[row]] = await ROOT.execute(
    `SELECT COUNT(*) AS cnt
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [database, tableName, columnName]
  );
  return Number(row.cnt) > 0;
}

// Core user profile data. Passwords are deliberately stored in user_passwords
// instead of this table so public user responses never expose password hashes.
await ROOT.execute(`
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

if (!(await columnExists("users", "is_admin"))) {
  await ROOT.execute("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0");
}

if (!(await columnExists("users", "is_blocked"))) {
  await ROOT.execute("ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) DEFAULT 0");
}

// Authentication data is split from users and cascades away with the user row.
await ROOT.execute(`
  CREATE TABLE IF NOT EXISTS user_passwords (
    user_id  INT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB
`);

// App content tables mirror the JSONPlaceholder-style resources used by the UI.
// Foreign keys keep child records tied to their owning user/post/album.
await ROOT.execute(`
  CREATE TABLE IF NOT EXISTS todos (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    userId    INT NOT NULL,
    title     TEXT,
    completed TINYINT(1) DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await ROOT.execute(`
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
await ROOT.execute(`
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

// ── Migration: older databases were created before the userId column existed ──
const [[{ cnt: hasUserIdCol }]] = await ROOT.query(
  `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'userId'`,
  [database]
);
if (!hasUserIdCol) {
  await ROOT.execute(
    `ALTER TABLE comments
     ADD COLUMN userId INT NULL AFTER postId,
     ADD FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL`
  );
}

await ROOT.execute(`
  UPDATE comments c
  JOIN users u ON c.email = u.email AND c.name = u.name
  SET c.userId = u.id
  WHERE c.userId IS NULL
`);

await ROOT.execute(`
  UPDATE comments c
  JOIN posts p ON c.postId = p.id
  SET c.userId = p.userId
  WHERE c.userId IS NULL
`);

await ROOT.execute(`
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

await ROOT.execute(`
  CREATE TABLE IF NOT EXISTS albums (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title  TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await ROOT.execute(`
  CREATE TABLE IF NOT EXISTS photos (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    albumId      INT NOT NULL,
    title        TEXT,
    url          VARCHAR(500),
    thumbnailUrl VARCHAR(500),
    FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

// ── Seed data (skip if already populated) ────────────────────────────────────
// A non-empty users table means this database was already initialized. This
// keeps repeated npm/server starts from duplicating demo data.
const [[{ cnt }]] = await ROOT.execute("SELECT COUNT(*) AS cnt FROM users");
if (Number(cnt) === 0) {
  console.log("Seeding database...");

  const users = [
    [1,"Leanne Graham","Bret","Sincere@april.biz","1-770-736-8031 x56442","hildegard.org","Kulas Light","Apt. 556","Gwenborough","92998-3874","Romaguera-Crona","Multi-layered client-server neural-net","harness real-time e-markets"],
    [2,"Ervin Howell","Antonette","Shanna@melissa.tv","010-692-6593 x09125","anastasia.net","Victor Plains","Suite 879","Wisokyburgh","90566-7771","Deckow-Crist","Proactive didactic contingency","synergize scalable supply-chains"],
    [3,"Clementine Bauch","Samantha","Nathan@yesenia.net","1-463-123-4447","ramiro.info","Douglas Extension","Suite 847","McKenziehaven","59590-4157","Romaguera-Jacobson","Face to face bifurcated interface","e-enable strategic applications"],
    [4,"Eitan","Eitan","eyklein6@gmail.com","0547899762","1111","H st","a","PT","4927581","a","",""],
    [5,"איתמר חיימוב","itamar","oleter479@gmail.com","0542988813","123456","הסיבים 48","61","גבעת שמואל","5400206","i","",""],
    [6,"איתמר חיימוב","user","oleter479@gmail.com","0542988813","1234","הסיבים 48","61","גבעת שמואל","5400206","12","",""],
    [7,"ערן קליין","Eitan1","eran@kleincpa.co.il","0547799902","1111","החשמונאים","5","פתח תקווה","4927517","11","",""],
    [8,"יצחק נדל","ita","eran@kleincpa.co.il","0547799902","1111","החשמונאים 5","5","פתח תקווה","4927581","1","",""],
  ];

  for (const u of users) {
    // u[5] is the seed "password" for this demo dataset — it's hashed below and
    // never written into the users.website column, so it can't leak via GET /users.
    const seedPassword = u[5];
    const row = [...u];
    row[5] = "";

    await ROOT.execute(
      `INSERT INTO users (id,name,username,email,phone,website,street,suite,city,zipcode,company_name,company_catchphrase,company_bs)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      row
    );
    const hash = await bcrypt.hash(seedPassword, 10);
    await ROOT.execute(
      "INSERT INTO user_passwords (user_id, password) VALUES (?,?)",
      [u[0], hash]
    );
  }

  const todos = [
    [1,1,"delectus aut autem",0],
    [2,1,"quis ut nam facilis et officia qui",0],
    [3,1,"fugiat veniam minus",1],
    [4,1,"et porro tempora",0],
    [5,2,"laboriosam mollitia et enim quasi adipisci",0],
    [6,2,"qui ullam ratione quibusdam voluptatem quia omnis",1],
    [7,3,"illo expedita consequatur quia in",0],
    [8,3,"quo adipisci enim quam ut ab",1],
    [9,4,"Crossfit",0],
    [11,7,"as",0],
    [12,7,"ds",0],
    [13,7,"fd",0],
    [14,7,"qw",0],
  ];
  for (const t of todos) {
    await ROOT.execute("INSERT INTO todos (id,userId,title,completed) VALUES (?,?,?,?)", t);
  }

  const posts = [
    [1,1,"sunt aut facere repellat provident occaecati","quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"],
    [2,1,"qui est esse","est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis qui aperiam non debitis possimus"],
    [3,2,"ea molestias quasi exercitationem repellat","et iusto sed quo iure voluptatem occaecati omnis eligendi aut ad voluptatem doloribus vel accusantium quis pariatur molestiae porro eius odio et labore et velit aut"],
    [4,3,"eum et est occaecati","ullam et saepe reiciendis voluptatem adipisci sit amet autem assumenda provident rerum culpa quis hic commodi nesciunt rem tenetur doloremque ipsam iure quis sunt voluptatem rerum illo velit"],
    [5,4,"Workout","Today at 8"],
    [6,4,"Sleep","At 11"],
    [7,5,"wrfw","wefwf"],
    [8,7,"v","v"],
    [9,7,"dfg","gfd"],
  ];
  for (const p of posts) {
    await ROOT.execute("INSERT INTO posts (id,userId,title,body) VALUES (?,?,?,?)", p);
  }

  const comments = [
    [1,1,1,"Leanne Graham","Sincere@april.biz","laudantium enim quasi est quidem magnam voluptate ipsam eos tempora"],
    [2,1,2,"Ervin Howell","Shanna@melissa.tv","est natus enim nihil est dolore omnis voluptatem numquam"],
    [3,2,1,"Leanne Graham","Sincere@april.biz","quia molestiae reprehenderit quasi aspernatur"],
    [4,3,2,"Ervin Howell","Shanna@melissa.tv","non et atque occaecati deserunt quas accusantium unde odit nobis qui voluptatem"],
    [5,1,7,"ערן קליין","eran@kleincpa.co.il","we"],
  ];
  for (const c of comments) {
    await ROOT.execute("INSERT INTO comments (id,postId,userId,name,email,body) VALUES (?,?,?,?,?,?)", c);
  }

  const albums = [
    [1,1,"quidem molestiae enim"],
    [2,1,"sunt qui excepturi placeat culpa"],
    [3,2,"omnis laborum odio"],
    [4,3,"non esse culpa molestiae omnis sed optio"],
    [5,4,"Sleep"],
    [6,4,"ME"],
    [7,5,"'/גק'/"],[8,7,"as"],[9,7,"vcxb"],[10,7,"gf"],[11,7,"qw"],[13,7,"w"],[14,7,"fd"],[15,7,"re"],[16,7,"ad"],
  ];
  for (const a of albums) {
    await ROOT.execute("INSERT INTO albums (id,userId,title) VALUES (?,?,?)", a);
  }

  const photos = [];
  // Generate predictable placeholder photo rows instead of storing a long
  // static fixture list in this script.
  for (let i = 1; i <= 50; i++) {
    const albumId = i <= 7 ? 1 : i <= 12 ? 2 : i <= 17 ? 3 : i <= 22 ? 4 : i <= 27 ? 5 : i <= 32 ? 6 : 7;
    photos.push([i, albumId,
      `photo title ${i}`,
      `https://picsum.photos/seed/project5-photo-${i}/600/400`,
      `https://picsum.photos/seed/project5-photo-${i}/160/120`,
    ]);
  }
  for (const p of photos) {
    await ROOT.execute("INSERT INTO photos (id,albumId,title,url,thumbnailUrl) VALUES (?,?,?,?,?)", p);
  }

  console.log("Seeding complete.");
} else {
  console.log(`Database already has ${cnt} user(s), skipping seed.`);
}

// ── Migration: older databases stored plaintext passwords and leaked them via
// the users.website column. Hash anything still plaintext and scrub website. ──
const [plaintextPasswords] = await ROOT.execute(
  "SELECT user_id, password FROM user_passwords WHERE password NOT LIKE '$2%'"
);
for (const row of plaintextPasswords) {
  // bcrypt hashes start with $2*. Anything else here is legacy plaintext.
  const hash = await bcrypt.hash(row.password, 10);
  await ROOT.execute("UPDATE user_passwords SET password = ? WHERE user_id = ?", [hash, row.user_id]);
}
if (plaintextPasswords.length) {
  console.log(`Migrated ${plaintextPasswords.length} plaintext password(s) to bcrypt hashes.`);
}

// Some old seed data used users.website as a temporary password slot. Clear it
// after hashes exist so GET /users only returns profile data.
const [websiteScrub] = await ROOT.execute("UPDATE users SET website = '' WHERE website <> ''");
if (websiteScrub.affectedRows) {
  console.log(`Cleared leaked password value out of website field for ${websiteScrub.affectedRows} user(s).`);
}

const [[adminUser]] = await ROOT.execute("SELECT id FROM users WHERE username = ?", ["admin"]);
if (!adminUser) {
  const [result] = await ROOT.execute(
    `INSERT INTO users (name,username,email,phone,website,street,suite,city,zipcode,company_name,company_catchphrase,company_bs,is_admin,is_blocked)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ["System Admin", "admin", "admin@example.com", "", "", "", "", "", "", "Project 6", "", "", 1, 0]
  );
  const hash = await bcrypt.hash("admin123", 10);
  await ROOT.execute("INSERT INTO user_passwords (user_id, password) VALUES (?,?)", [result.insertId, hash]);
  console.log("Created admin account (username: admin, password: admin123).");
} else {
  await ROOT.execute("UPDATE users SET is_admin = 1, is_blocked = 0 WHERE id = ?", [adminUser.id]);
}

await ROOT.end();
console.log("Database initialization done.");
