require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log("Connecting to TiDB Cloud...");
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  });

  try {
    let sql1 = fs.readFileSync(path.join(__dirname, '../db/init/01-init.sql'), 'utf-8');
    let sql2 = fs.readFileSync(path.join(__dirname, '../db/init/02-notifications.sql'), 'utf-8');
    
    // ลบคำสั่ง CREATE DATABASE เพราะบน TiDB Cloud จะใช้ test แทน
    sql1 = sql1.replace(/CREATE DATABASE IF NOT EXISTS pethome_db[^;]+;/g, '');
    sql1 = sql1.replace(/USE pethome_db;/g, '');
    sql2 = sql2.replace(/USE pethome_db;/g, '');

    console.log("Creating tables and inserting seed data...");
    await pool.query(sql1);
    await pool.query(sql2);

    console.log("✅ Successfully initialized database on TiDB Cloud!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    await pool.end();
  }
}

run();
