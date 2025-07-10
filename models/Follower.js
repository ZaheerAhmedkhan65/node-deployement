const db = require('../config/connection');

class Follower {
    static async createFollower(followerId, userId) {
        const [result] = await db.query(
            'INSERT INTO followers (follower_user_id, followed_user_id) VALUES (?, ?)',
            [followerId, userId]
        );
        const [follow] = await db.query('SELECT * FROM followers WHERE id = ?', [result.insertId]);
        return follow[0];
    }

    static async deleteFollower(followerId, followingId) {
        const [follow] = await db.query('SELECT * FROM followers WHERE follower_user_id = ? AND followed_user_id = ?', [followerId, followingId]);
        await db.query('DELETE FROM follows WHERE follower_user_id = ? AND followed_user_id = ?', [followerId, followingId]);
        return follow[0]; // Return deleted follow data if needed
    }

    static async getFollowersByUserId(userId) {
        const [followers] = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.avatar,
                f.created_at as followed_at
            FROM followers f
            JOIN users u ON f.followed_user_id = u.id
            WHERE f.follower_user_id = ?
            ORDER BY f.created_at DESC
        `, [userId]);
        
        return followers;
    }

    static async getFollowingsCountByUserId(userId) {
        const [count] = await db.query('SELECT COUNT(*) as count FROM followers WHERE follower_user_id = ?', [userId]);
        return count[0].count;
    }

    static async getFollowersCountByUserId(userId) {
        const [count] = await db.query('SELECT COUNT(*) as count FROM followers WHERE followed_user_id = ?', [userId]);
        return count[0].count;
    }

    static async getFollowersByUserIdAndFollowerId(userId, followerId) {
        const [follows] = await db.query('SELECT * FROM followers WHERE follower_user_id = ? AND followed_user_id = ?', [userId, followerId]);
        return follows;
    }

    static async getFollowingsByUserId(userId) {
        const [follows] = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.avatar,
                f.created_at as followed_at
            FROM followers f
            JOIN users u ON f.follower_user_id = u.id
            WHERE f.followed_user_id = ?
            ORDER BY f.created_at DESC
            `, [userId]);
        return follows;
    }
    
}

module.exports = Follower;
