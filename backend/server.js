require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("./db/userModel"); // model user
const Account = require("./db/accountModel"); // model account
const dbConnect = require("./db/dbConnect");
const commentRouter = require("./routes/commentRouter");
const LoginRouter = require("./routes/LoginRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const UserRouter = require("./routes/UserRouter");
const app = express();
const PORT = process.env.PORT || 8081;
dbConnect();
app.use(
  cors({
    origin: "https://rrssn6-3000.csb.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api", commentRouter);
app.use("/api", LoginRouter);
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  try {
    const account = await Account.findOne({ username });
    if (!account || account.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = await User.findById(account.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const payload = {
      id: user._id,
      username: account.username,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, user: payload });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/current_user", authenticateJWT, async (req, res) => {
  res.json(req.user);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
