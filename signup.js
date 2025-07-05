const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());



const users = []; // simulate DB

// signup route

app.post("/signup", async (req, res) => {
  const { username, mail, password } = req.body;

  if (!username || !mail || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existingUser = users.find((u) => u.mail === mail);
  if (existingUser) {
    return res.status(409).json({
      error: "Email already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // console.log(hashedPassword);
  const user = { username, mail, password: hashedPassword };
  users.push(user); // in real apps, save to DB

  const token = jwt.sign({ mail }, process.env.SECRET_KEY, { expiresIn: "1h" });
  // console.log(token);
  res.status(201).json({
    message: "User registered successfully",
    username,
    mail,
    password,
    token,
  });
  console.log("signup Success!")
});

// login route
app.post("/login", async (req, res) => {
    const { mail, password } = req.body;

    // Check fields
    if (!mail || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = users.find(u => u.mail === mail);
    console.log("login", user)
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ mail: user.mail }, process.env.SECRET_KEY, { expiresIn: "30s" });

    res.status(200).json({
        message: "Login successful Baby",
        token,
        user: {
            username: user.username,
            mail: user.mail
        }
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));