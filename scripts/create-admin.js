const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'db', 'landing_c.db');
const db = new sqlite3.Database(dbPath);

const nickname = 'admin';
const password = 'admin123';
const role = 'admin';

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      `INSERT INTO users (nickname, password, role) VALUES (?, ?, ?)`,
      [nickname, hashedPassword, role],
      (err) => {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log('Admin user already exists.');
          } else {
            console.error('Error creating admin:', err.message);
          }
        } else {
          console.log(`Admin user created: ${nickname} / ${password}`);
        }
        db.close();
      }
    );
  } catch (err) {
    console.error('Bcrypt error:', err);
    db.close();
  }
}

createAdmin();
