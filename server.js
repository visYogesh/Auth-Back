const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY

// Dummy Login route
app.post("/login", (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

app.get("/home", (req, res) => {
  res.send("Welcome to the Home Page!");
})


// 🔒 Dashboard-specific rate limiter
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  header: (req, res) => {
    res.status(429).json({ error: "Try again later" });
  },
});


// Protected route with JWT + rate limiting
app.get("/dashboard", dashboardLimiter, (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Token missing");

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.send(`Welcome ${decoded.username}!`);
  } catch (err) {
    res.status(403).send("Invalid Token");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
