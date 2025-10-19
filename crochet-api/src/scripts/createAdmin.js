// src/scripts/createAdmin.js
import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function getColumns(pool, table){
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return new Set(rows.map(r => r.COLUMN_NAME));
}

async function ensureUsuariosSchema(pool){
  // Crea la tabla si no existe (con el esquema que usa tu backend)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      rol ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Verifica columnas actuales y añade las que falten
  const cols = await getColumns(pool, 'usuarios');

  if (!cols.has('email')) {
    await pool.query(`ALTER TABLE usuarios ADD COLUMN email VARCHAR(150) NOT NULL UNIQUE`);
  }
  if (!cols.has('password')) {
    await pool.query(`ALTER TABLE usuarios ADD COLUMN password VARCHAR(255) NOT NULL`);
  }
  if (!cols.has('rol')) {
    await pool.query(`ALTER TABLE usuarios ADD COLUMN rol ENUM('admin','cliente') NOT NULL DEFAULT 'cliente'`);
  }
  if (!cols.has('fecha_creacion')) {
    await pool.query(`ALTER TABLE usuarios ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  }
  // Si tuvieras una columna antigua 'contrasena' o 'pass', puedes migrarla a 'password' aquí:
  // if (cols.has('contrasena') && !cols.has('password')) { ... }
}

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@crochet.test';
  const plain = process.env.ADMIN_PASS  || 'Admin123*';

  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'crochetbyless',
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10
  });

  await ensureUsuariosSchema(pool);

  const hash = await bcrypt.hash(plain, 10);

  // Upsert admin por email (crea si no existe, si existe actualiza pass y rol)
  await pool.query(
    `INSERT INTO usuarios (email, password, rol)
     VALUES (?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password=VALUES(password), rol='admin'`,
    [email, hash]
  );

  console.log(`✔ Admin listo:
  email: ${email}
  pass : ${plain}`);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
