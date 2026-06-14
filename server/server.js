import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import usersRouter    from "./routes/users.js";
import todosRouter    from "./routes/todos.js";
import postsRouter    from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
import albumsRouter   from "./routes/albums.js";
import photosRouter   from "./routes/photos.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => { console.log(`${req.method} ${req.url}`); next(); });

app.use("/users",    usersRouter);
app.use("/todos",    todosRouter);
app.use("/posts",    postsRouter);
app.use("/comments", commentsRouter);
app.use("/albums",   albumsRouter);
app.use("/photos",   photosRouter);

app.get("/", (_req, res) => res.json({ status: "Project 6 API running" }));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
