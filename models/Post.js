const db = require('../config/connection');

class Post {
    // Create a new post
    static async createPost(title, content, published_at, user_id) {
        const [result] = await db.query(
            'INSERT INTO posts (title, content, published_at, user_id) VALUES (?, ?, ?, ?)',
            [title, content, published_at, user_id]
        );
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
        return post[0];
    }

    // Get post by ID
    static async getPostById(id) {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        return post[0];
    }

    // Get all posts
    static async getAllPosts() {
        const [posts] = await db.query('SELECT * FROM posts');
        return posts;
    }

    // Get all posts by a specific user
    static async getPostsByUser(user_id) {
        const [posts] = await db.query('SELECT * FROM posts WHERE user_id = ?', [user_id]);
        return posts;
    }

    // Update a post
    static async updatePost(id, title, content, published_at) {
        await db.query(
            'UPDATE posts SET title = ?, content = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, published_at, id]
        );
        const [updatedPost] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        return updatedPost[0];
    }

    // Delete a post
    static async deletePost(id) {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        await db.query('DELETE FROM posts WHERE id = ?', [id]);
        return post[0]; // Return deleted post data if needed
    }

    static async searchPost(query){
        console.log("nskmcsmcskcm",query);
        const [results] = await db.query('SELECT * FROM posts WHERE title LIKE ? OR content LIKE ?',[`%${query}%`, `%${query}%`]);
        return results;
    }

    static async toggleLike(postId, userId, type) {
        // Check if user already reacted
        const [existing] = await db.query(
            'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );
    
        if (existing && existing.length > 0) {
            const currentType = existing[0].type;
            if (currentType === type) {
                // Remove reaction if same type clicked again
                await db.query(
                    'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
                    [postId, userId]
                );
                return { action: 'removed', type };
            } else {
                // Update reaction if different type
                await db.query(
                    'UPDATE post_likes SET type = ? WHERE post_id = ? AND user_id = ?',
                    [type, postId, userId]
                );
                return { action: 'updated', from: currentType, to: type };
            }
        } else {
            // Add new reaction
            await db.query(
                'INSERT INTO post_likes (post_id, user_id, type) VALUES (?, ?, ?)',
                [postId, userId, type]
            );
            return { action: 'added', type };
        }
    }

    static async getReactions(postId) {
        const [likes] = await db.query(
            'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND type = "like"',
            [postId]
        );
        const [dislikes] = await db.query(
            'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND type = "dislike"',
            [postId]
        );
        return {
            likes: likes[0].count,
            dislikes: dislikes[0].count
        };
    }

    static async getUserReaction(postId, userId) {
        const [reaction] = await db.query(
            'SELECT type FROM post_likes WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );
        return reaction.length > 0 ? reaction[0].type : null;
    }

    // Repost methods
    static async toggleRepost(postId, userId) {
        // Check if already reposted
        const existing = await db.query(
            'SELECT * FROM post_reposts WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existing.length > 0) {
            // Remove repost
            await db.query(
                'DELETE FROM post_reposts WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
            return { action: 'removed' };
        } else {
            // Add repost
            await db.query(
                'INSERT INTO post_reposts (post_id, user_id) VALUES (?, ?)',
                [postId, userId]
            );
            return { action: 'added' };
        }
    }

    static async getRepostCount(postId) {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM post_reposts WHERE post_id = ?',
            [postId]
        );
        return result[0].count;
    }

    static async hasReposted(postId, userId) {
        const [result] = await db.query(
            'SELECT 1 FROM post_reposts WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );
        return result.length > 0;
    }

    // models/Post.js
static async getTrendingPosts(limit = 10, timePeriod = '24 HOUR') {
    const query = `
        SELECT 
            p.*,
            COUNT(DISTINCT l.id) AS like_count,
            COUNT(DISTINCT r.id) AS repost_count,
            COUNT(DISTINCT l.id) + (COUNT(DISTINCT r.id) * 2) AS engagement_score
        FROM 
            posts p
        LEFT JOIN 
            post_likes l ON p.id = l.post_id AND l.created_at >= NOW() - INTERVAL ${timePeriod}
        LEFT JOIN 
            post_reposts r ON p.id = r.post_id AND r.created_at >= NOW() - INTERVAL ${timePeriod}
        WHERE 
            p.created_at >= NOW() - INTERVAL 7 DAY
        GROUP BY 
            p.id
        ORDER BY 
            engagement_score DESC,
            like_count DESC,
            repost_count DESC
        LIMIT ?
    `;
    
    const [posts] = await db.query(query, [limit]);
    return posts;
}
}

module.exports = Post;
