const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');
const dbPath = path.join(dataDir, 'rpg.sqlite');

function applySchema(db) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      owner_email TEXT,
      name TEXT,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS master_data (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

function recreateDatabase() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);
  applySchema(db);
  db.close();
}

function configurarBanco() {
  recreateDatabase();
  console.log(`Banco offline recriado em ${dbPath}`);
  return true;
}

if (require.main === module) {
  const ok = configurarBanco();
  process.exitCode = ok ? 0 : 1;
}

module.exports = { configurarBanco, applySchema, dbPath };
