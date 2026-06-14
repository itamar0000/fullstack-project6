import mysql from "mysql2/promise";
import { dbConfig } from "./config.js";

// Connect without selecting a database so we can create it if missing.
const { database, ...serverConfig } = dbConfig;

const ROOT = await mysql.createConnection({
  ...serverConfig,
  multipleStatements: true,
});

await ROOT.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await ROOT.query(`USE \`${database}\``);

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
    company_bs   TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await ROOT.execute(`
  CREATE TABLE IF NOT EXISTS user_passwords (
    user_id  INT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB
`);

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

await ROOT.execute(`
  CREATE TABLE IF NOT EXISTS comments (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    postId INT NOT NULL,
    name   VARCHAR(255),
    email  VARCHAR(255),
    body   TEXT,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
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
    await ROOT.execute(
      `INSERT INTO users (id,name,username,email,phone,website,street,suite,city,zipcode,company_name,company_catchphrase,company_bs)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      u
    );
    // store password = website field value
    await ROOT.execute(
      "INSERT INTO user_passwords (user_id, password) VALUES (?,?)",
      [u[0], u[5]]
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
    [1,1,"Leanne Graham","Sincere@april.biz","laudantium enim quasi est quidem magnam voluptate ipsam eos tempora"],
    [2,1,"Ervin Howell","Shanna@melissa.tv","est natus enim nihil est dolore omnis voluptatem numquam"],
    [3,2,"Leanne Graham","Sincere@april.biz","quia molestiae reprehenderit quasi aspernatur"],
    [4,3,"Ervin Howell","Shanna@melissa.tv","non et atque occaecati deserunt quas accusantium unde odit nobis qui voluptatem"],
    [5,1,"ערן קליין","eran@kleincpa.co.il","we"],
  ];
  for (const c of comments) {
    await ROOT.execute("INSERT INTO comments (id,postId,name,email,body) VALUES (?,?,?,?,?)", c);
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

await ROOT.end();
console.log("Database initialization done.");
