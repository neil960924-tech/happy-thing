import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("stories.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_url TEXT,
    coins INTEGER DEFAULT 0,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add avatar_url column if it doesn't exist
try {
  db.prepare("SELECT avatar_url FROM users LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT");
}

// Migration: Add email column if it doesn't exist (for existing databases)
try {
  db.prepare("SELECT email FROM users LIMIT 1").get();
} catch (e) {
  console.log("Migrating database: Adding email column to users table");
  db.exec("ALTER TABLE users ADD COLUMN email TEXT UNIQUE NOT NULL DEFAULT 'temp@example.com'");
}

// Migration: Add coins column if it doesn't exist
try {
  db.prepare("SELECT coins FROM users LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0");
}

// Migration: Add last_login_at column if it doesn't exist
try {
  db.prepare("SELECT last_login_at FROM users LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE users ADD COLUMN last_login_at DATETIME");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    category TEXT,
    author TEXT,
    image_url TEXT,
    color TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Migration: Add color column if it doesn't exist
try {
  db.prepare("SELECT color FROM stories LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE stories ADD COLUMN color TEXT");
}

// Check if image_url column exists, if not add it (for existing DBs)
try {
  db.prepare("SELECT image_url FROM stories LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE stories ADD COLUMN image_url TEXT");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '10mb' }));
  app.use(session({
    secret: "peach-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  }));

  // Auth API
  app.post("/api/auth/signup", async (req, res) => {
    const { username, password, email, avatar_url } = req.body;
    if (!username || !password || !email) return res.status(400).json({ error: "Username, email and password required" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const info = db.prepare("INSERT INTO users (username, email, password, avatar_url, coins) VALUES (?, ?, ?, ?, ?)").run(username, email, hashedPassword, avatar_url || null, 0);
      const user = { id: info.lastInsertRowid, username, email, avatar_url, coins: 0 };
      (req.session as any).user = user;
      res.status(201).json(user);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: "Username or email already exists" });
      } else {
        res.status(500).json({ error: "Signup failed" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Check for daily login reward
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastLogin = user.last_login_at ? user.last_login_at.split('T')[0] : null;
      
      let loginReward = 0;
      if (lastLogin !== today) {
        loginReward = 10; // Daily reward: 10 coins
        db.prepare("UPDATE users SET coins = coins + ?, last_login_at = ? WHERE id = ?").run(loginReward, now.toISOString(), user.id);
        user.coins += loginReward;
        user.last_login_at = now.toISOString();
      } else {
        db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(now.toISOString(), user.id);
      }

      const { password: _, ...userWithoutPassword } = user;
      (req.session as any).user = userWithoutPassword;
      res.json({ ...userWithoutPassword, loginReward });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) return res.json(null);
    
    const user = db.prepare("SELECT id, username, email, avatar_url, coins FROM users WHERE id = ?").get(sessionUser.id);
    res.json(user || null);
  });

  app.put("/api/auth/avatar", (req, res) => {
    const user = (req.session as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { avatar_url } = req.body;
    if (!avatar_url) return res.status(400).json({ error: "Avatar URL required" });

    try {
      db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(avatar_url, user.id);
      const updatedUser = db.prepare("SELECT id, username, email, avatar_url, coins FROM users WHERE id = ?").get(user.id);
      (req.session as any).user = updatedUser;
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update avatar" });
    }
  });

  app.get("/api/competition/weekly", (req, res) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    try {
      const stats = db.prepare(`
        SELECT users.id, users.username, users.avatar_url, COUNT(stories.id) as count
        FROM users
        LEFT JOIN stories ON users.id = stories.user_id AND stories.created_at >= ?
        GROUP BY users.id
        ORDER BY count DESC
      `).all(oneWeekAgo.toISOString());
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch competition stats" });
    }
  });

  app.post("/api/competition/claim", (req, res) => {
    const user = (req.session as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // In a real app, we'd check if the user actually won and if they already claimed.
    // For this demo, we'll simulate the logic.
    res.json({ success: true, message: "獎勵已領取" });
  });

  // Stories API
  app.get("/api/stories", (req, res) => {
    try {
      const stories = db.prepare(`
        SELECT stories.*, users.avatar_url as author_avatar 
        FROM stories 
        LEFT JOIN users ON stories.user_id = users.id 
        ORDER BY stories.created_at DESC
      `).all();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  app.post("/api/stories", (req, res) => {
    const { lat, lng, content, category, image_url, color } = req.body;
    const user = (req.session as any).user;
    
    if (!lat || !lng || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const author = user ? user.username : "Anonymous";
    const userId = user ? user.id : null;
    const title = content.substring(0, 20) + (content.length > 20 ? "..." : "");

    try {
      const info = db.prepare(
        "INSERT INTO stories (lat, lng, title, content, category, author, image_url, color, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(lat, lng, title, content, category || "general", author, image_url || null, color || null, userId);
      
      const newStory = db.prepare(`
        SELECT stories.*, users.avatar_url as author_avatar 
        FROM stories 
        LEFT JOIN users ON stories.user_id = users.id 
        WHERE stories.id = ?
      `).get(info.lastInsertRowid);
      res.status(201).json(newStory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save story" });
    }
  });

  app.put("/api/stories/:id", (req, res) => {
    const { id } = req.params;
    const { lat, lng, content, category, image_url, color } = req.body;
    const user = (req.session as any).user;

    const story = db.prepare("SELECT * FROM stories WHERE id = ?").get(id) as any;
    if (!story) return res.status(404).json({ error: "Story not found" });

    // Only author can edit (if it was created by a user)
    if (story.user_id && (!user || story.user_id !== user.id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const title = content ? (content.substring(0, 20) + (content.length > 20 ? "..." : "")) : story.title;

    try {
      db.prepare(
        "UPDATE stories SET lat = ?, lng = ?, title = ?, content = ?, category = ?, image_url = ?, color = ? WHERE id = ?"
      ).run(
        lat ?? story.lat,
        lng ?? story.lng,
        title,
        content ?? story.content,
        category ?? story.category,
        image_url ?? story.image_url,
        color ?? story.color,
        id
      );
      const updatedStory = db.prepare(`
        SELECT stories.*, users.avatar_url as author_avatar 
        FROM stories 
        LEFT JOIN users ON stories.user_id = users.id 
        WHERE stories.id = ?
      `).get(id);
      res.json(updatedStory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update story" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
