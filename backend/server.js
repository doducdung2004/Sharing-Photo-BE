require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const MongoStore = require("connect-mongo");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const LoginRouter = require("./routes/LoginRouter");
const commentRouter = require("./routes/commentRouter");
const PORT = process.env.PORT || 8081 ;
dbConnect();
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: "sessions",
    }),
    cookie: {
        httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    }
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
    console.log("Cookies from client:", req.headers.cookie);
    console.log("Session user in req.session:", req.session.user);
    next();
});

app.use("/api", commentRouter);
app.use("/api", LoginRouter);
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.get("/api/current_user", (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
});
app.get("/", (req, res) => {
    res.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(PORT, () => {
    console.log("Server listening on port ${PORT}");
});
