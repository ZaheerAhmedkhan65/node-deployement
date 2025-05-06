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

    static async findAll({ where }) {
        let query = 'SELECT * FROM users WHERE id IN (' + where.id.map(() => '?').join(', ') + ')';
        const [rows] = await db.execute(query, where.id);
        return rows;
      }

    static async findUser(username){
        const [user] = await db.query('SELECT * FROM users WHERE name = ? OR email = ?', [username,username]);
        return user[0];
    }

    static async findById(id){
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return user[0];
    }

    static async getUserPosts(userId) {
        const [posts] = await db.query('SELECT * FROM posts WHERE user_id = ?', [userId]);
        return posts;
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findByResetToken(token) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()',
            [token]
        );
        return rows[0];
    }

    static async updateUserPassword(id, updates) {
        const { resetToken, resetTokenExpiry, password } = updates;
        
        const [result] = await db.query(
            'UPDATE users SET resetToken = ?, resetTokenExpiry = ?, password = ? WHERE id = ?',
            [resetToken, resetTokenExpiry, password, id]
        );
        return result;
    }

    static async updateUser(id, updates) {
        const { resetToken, resetTokenExpiry } = updates;
        
        const [result] = await db.query(
            'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
            [resetToken, resetTokenExpiry, id]
        );
        return result;
    }

    static async findByUsername(name) {
        const [rows] = await db.query('SELECT * FROM users WHERE name = ?', [name]);
        return rows[0];
    }

    static async updateAvatar(id, avatar, avatar_public_id) {
        const [result] = await db.query(
            'UPDATE users SET avatar = ?, avatar_public_id = ? WHERE id = ?',
            [avatar, avatar_public_id, id]
        );
        return result;
    }
}

module.exports = User;
