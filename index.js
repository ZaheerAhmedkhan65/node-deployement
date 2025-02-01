const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index',{title: 'Blog'});
});

app.get('/posts', (req, res) => {
    res.render('posts',{title: 'Posts'}); 
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});