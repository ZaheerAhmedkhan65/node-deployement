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
}

module.exports = Post;
