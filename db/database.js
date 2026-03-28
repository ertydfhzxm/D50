const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'landing_c.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Initialize Schemas
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        points INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]', -- JSON array of tags
        force_reset INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Migration check (Ensure columns exist in existing DB)
      db.all("PRAGMA table_info(users)", (err, columns) => {
        if (!err && columns) {
          if (!columns.some(col => col.name === 'tags')) {
            db.run("ALTER TABLE users ADD COLUMN tags TEXT DEFAULT '[]'");
          }
          if (!columns.some(col => col.name === 'email')) {
            db.run("ALTER TABLE users ADD COLUMN email TEXT UNIQUE");
          }
          if (!columns.some(col => col.name === 'force_reset')) {
            db.run("ALTER TABLE users ADD COLUMN force_reset INTEGER DEFAULT 0");
          }
        }
      });

      // Diaries table (for M2)
      db.run(`CREATE TABLE IF NOT EXISTS diaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        mood TEXT,
        content TEXT,
        ai_feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Games saves table (for M4)
      db.run(`CREATE TABLE IF NOT EXISTS game_saves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        slot_id INTEGER,
        game_data TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        tag TEXT,
        content TEXT,
        empathy_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending_review',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // story_replies table (for Module C)
      db.run(`CREATE TABLE IF NOT EXISTS story_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        story_id INTEGER,
        user_id INTEGER,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(story_id) REFERENCES stories(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Activities table (Offline events)
      db.run(`CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        description TEXT,
        location TEXT,
        event_time DATETIME,
        max_participants INTEGER DEFAULT 15,
        current_participants INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending_review',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);
      // Checkins table (Community co-creation)
      db.run(`CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        task_name TEXT,
        points_earned INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // M7: User Events / Telemetry table
      db.run(`CREATE TABLE IF NOT EXISTS user_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT NOT NULL, 
        event_data TEXT, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // M8.2: Chat Memory
      db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // M8.1: Resonance Matches
      db.run(`CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_a INTEGER,
        user_b INTEGER,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_a) REFERENCES users(id),
        FOREIGN KEY(user_b) REFERENCES users(id)
      )`);

      // M8.3: Direct Messages (Anonymous Chat)
      db.run(`CREATE TABLE IF NOT EXISTS direct_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER,
        sender_id INTEGER,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(match_id) REFERENCES matches(id)
      )`);

      // M8.4: Compliments
      db.run(`CREATE TABLE IF NOT EXISTS compliments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user INTEGER,
        to_user INTEGER,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(from_user) REFERENCES users(id),
        FOREIGN KEY(to_user) REFERENCES users(id)
      )`);

      // M8.5: Notifications
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // P1: Relationship tables for duplicate prevention
      db.run(`CREATE TABLE IF NOT EXISTS story_empathy_records (
        story_id INTEGER,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (story_id, user_id),
        FOREIGN KEY(story_id) REFERENCES stories(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS activity_participants (
        activity_id INTEGER,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (activity_id, user_id),
        FOREIGN KEY(activity_id) REFERENCES activities(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);
    });
  }
});
// ==========================================
// Promise Wrappers (P2 Architecture fix)
// ==========================================
db.dbGet = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.dbAll = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.dbRun = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

module.exports = db;
