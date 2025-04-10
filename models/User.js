const db = require('../config/connection');

class User {
    static async createUser(name, email, passwordDigest) {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, passwordDigest]
        );
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        return user[0];
    }

    static async getUserById(id) {
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return user[0];
    }

    static async getAllUsers() {
        const [users] = await db.query('SELECT * FROM users');
        return users;
    }

    static async findByUsername(username){
        const [user] = await db.query('SELECT * FROM users WHERE name = ? OR email = ?', [username,username]);
        return user[0];
    }

    static async getUserPosts(userId) {
        const [posts] = await db.query('SELECT * FROM posts WHERE user_id = ?', [userId]);
        return posts;
    }
}

module.exports = User;
