const cron = require('node-cron');
const mysql = require('mysql2/promise');
require('dotenv').config();
// Use connection pooling for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true, // Enable SSL for TiDB Cloud
      }
});

console.log("Database connected");

// Run every minute
// cron.schedule('* * * * *', async () => {
//   try {
//     const now = new Date();

//     const [posts] = await pool.query(`
//       SELECT id FROM posts
//       WHERE is_draft = FALSE
//         AND scheduled_at <= ?
//         AND published_at IS NULL
//     `, [now]);

//     for (const post of posts) {
//       await pool.query(`
//         UPDATE posts
//         SET published_at = ?
//         WHERE id = ?
//       `, [now, post.id]);

//       console.log(`Published post ID: ${post.id}`);
//     }
//   } catch (err) {
//     console.error('Scheduled publishing failed:', err);
//   }
// });

module.exports = pool;
