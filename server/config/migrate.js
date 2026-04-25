import { pool } from './database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `)
    console.log('Migration complete: password_hash column added (nullable for existing rows).')
  } catch (err) {
    console.error('Migration error:', err)
  } finally {
    await pool.end()
  }
}

migrate()
