const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const db = require('./connection');
const cors = require('cors');
const { format } = require('date-fns');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', { title: 'Blog' });
});

app.get('/posts/new', (req, res) => {
    res.render('new', { title: 'New Post' });
});

app.get('/posts/search', (req, res) => {
    const { query } = req.query; 

    if (!query) {
        return res.redirect('/posts'); // Redirect to the main posts page if no query
    }

    const sql = `SELECT * FROM posts WHERE title LIKE ? OR content LIKE ?`;
    db.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
        if (err) {
            console.error('Error searching posts:', err);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.render('search_results', {
                title: 'Search Results',
                posts: [],
                query: query,
                message: 'No posts found matching your search.'
            });
        }
        results.forEach(post => { // Add formatted date to each post
            post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
        })
        res.render('search_results', {
            title: 'Search Results',
            posts: results,
            query: query
        });
    });
});

app.get('/posts/:id', (req, res) => {
    const postId = req.params.id;
    const sql = 'SELECT * FROM posts WHERE id = ?';
    db.query(sql, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching post:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(404).send('Post not found');
        }
        const post = results[0];
        post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
        res.render('post', { title: post.title, post });
    });
})

app.get('/posts', (req, res) => {
    const sql = 'SELECT * FROM posts ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).send('Database error');
        }

        results.forEach(post => {
            post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
        });

        res.render('posts', { title: 'Posts', posts: results });
    });
});

app.post('/posts/create', (req, res) => {
    const { title, content, published_at } = req.body;
    const sql = 'INSERT INTO posts (title, content, published_at) VALUES (?, ?, ?)';
    db.query(sql, [title, content, published_at || null], (err, result) => {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).send('Database error');
        }
        res.redirect('/posts');
    });
});

app.get('/posts/:id/edit', (req, res) => {
    const postId = req.params.id;
    const sql = 'SELECT * FROM posts WHERE id = ?';
    db.query(sql, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching post:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(404).send('Post not found');
        }
        const post = results[0];
        res.render('edit', { title: 'Edit Post', post });
    });
});

app.post('/posts/:id/update', (req, res) => {
    const postId = req.params.id;
    const { title, content, published_at } = req.body;
    const sql = 'UPDATE posts SET title = ?, content = ?, published_at = ? WHERE id = ?';
    db.query(sql, [title, content, published_at || null, postId], (err, result) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).send('Database error');
        }
        res.redirect('/posts');
    });
});

app.post('/posts/:id/delete', (req, res) => {
    const postId = req.params.id;
    const sql = 'DELETE FROM posts WHERE id = ?';
    db.query(sql, [postId], (err, result) => {
        if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).send('Database error');
        }
        res.redirect('/posts');
    });
});



app.listen(port, () => {
    console.log(`Server running on localhost:${port}`);
});