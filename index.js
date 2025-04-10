const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const cors = require('cors');
const { format } = require('date-fns');
const authRoutes = require("./routes/authRoutes")
const postsRoutes = require("./routes/postsRoutes")
const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.render('index', { title: 'Blog', user: req.session.user });
});



app.use("/auth",authRoutes);
app.use("/posts",postsRoutes);

app.listen(port, () => {
    console.log(`Server running on localhost:${port}`);
});