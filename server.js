import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const USERS_FILE = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "mentalmass_secret_key";
const JWT_EXPIRES_IN = "1h";

app.use(cors());
app.use(express.json());

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
      console.log("Created missing users.json with empty array");
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    const users = JSON.parse(data || "[]");
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing users file:", error);
    return false;
  }
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

app.get("/", (req, res) => {
  res.json({ message: "MENTALMASS Auth Server is running" });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const users = readUsers();
    const userExists = users.find((item) => item.email.toLowerCase() === email.toLowerCase().trim());
    if (userExists) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    if (!writeUsers(users)) {
      return res.status(500).json({ success: false, message: "Failed to save user" });
    }

    const token = generateToken(newUser);

    console.log("Registered new user", newUser.email);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const users = readUsers();
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);
    console.log("Login successful for", user.email);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

app.get("/profile", authMiddleware, (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Could not fetch profile" });
  }
});

app.get("/users", (req, res) => {
  try {
    const users = readUsers();
    const safeUsers = users.map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }));
    res.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Server running on port 5000");
});
