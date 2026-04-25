import bcrypt from 'bcryptjs'
import { pool } from './database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

async function createTables() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS votes CASCADE;
      DROP TABLE IF EXISTS suggestions CASCADE;
      DROP TABLE IF EXISTS memberships CASCADE;
      DROP TABLE IF EXISTS groups CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE groups (
        id SERIAL PRIMARY KEY,
        group_name VARCHAR(255) NOT NULL,
        admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        invite_code VARCHAR(50) UNIQUE NOT NULL
      );

      CREATE TABLE memberships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, group_id)
      );

      CREATE TABLE suggestions (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tmdb_id INTEGER,
        title VARCHAR(255) NOT NULL,
        poster_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE votes (
        id SERIAL PRIMARY KEY,
        suggestion_id INTEGER REFERENCES suggestions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(suggestion_id, user_id)
      );
    `)

    console.log('Tables created successfully')

    // Seed users (password: "password123" for all seed accounts)
    const hash = await bcrypt.hash('password123', 12)
    await pool.query(
      `INSERT INTO users (username, email, password_hash) VALUES
       ('alice',   'alice@example.com',   $1),
       ('bob',     'bob@example.com',     $1),
       ('charlie', 'charlie@example.com', $1)`,
      [hash]
    )

    // Seed groups
    await pool.query(`
      INSERT INTO groups (group_name, admin_id, invite_code) VALUES
      ('Friday Night Flicks', 1, 'FNF001'),
      ('Sci-Fi Sundays', 2, 'SFS002')
    `)

    // Seed memberships (admin is auto-included)
    await pool.query(`
      INSERT INTO memberships (user_id, group_id) VALUES
      (1, 1),
      (2, 1),
      (3, 1),
      (2, 2),
      (1, 2)
    `)

    // Seed suggestions for Friday Night Flicks (group 1)
    await pool.query(`
      INSERT INTO suggestions (group_id, user_id, tmdb_id, title, poster_path) VALUES
      (1, 1, 155,    'The Dark Knight',  '/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
      (1, 2, 157336, 'Interstellar',     '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'),
      (1, 3, 27205,  'Inception',        '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg')
    `)

    // Seed suggestions for Sci-Fi Sundays (group 2)
    await pool.query(`
      INSERT INTO suggestions (group_id, user_id, tmdb_id, title, poster_path) VALUES
      (2, 2, 438631, 'Dune',    '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg'),
      (2, 1, 329865, 'Arrival', '/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg')
    `)

    // Seed votes for Friday Night Flicks suggestions
    await pool.query(`
      INSERT INTO votes (suggestion_id, user_id, rating) VALUES
      (1, 1, 5),
      (1, 2, 4),
      (1, 3, 5),
      (2, 1, 5),
      (2, 2, 5),
      (2, 3, 4),
      (3, 1, 4),
      (3, 2, 3),
      (3, 3, 5)
    `)

    console.log('Seed data inserted successfully')
  } catch (err) {
    console.error('Error setting up database:', err)
  } finally {
    await pool.end()
  }
}

createTables()
