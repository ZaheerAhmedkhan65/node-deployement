const express = require('express');
const app = express();
const path = require('path');
const port = 3001;
const cors = require('cors');
const { format } = require('date-fns');
const authRoutes = require("./routes/authRoutes")
const postsRoutes = require("./routes/postsRoutes")
const userRoutes = require("./routes/userRoutes")
const mediaRoutes = require("./routes/mediaRoutes")
const notificationsRoutes = require("./routes/notificationsRoutes")
const cookieParser = require('cookie-parser');
const authenticate = require('./middlware/authenticate');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/auth", authRoutes);
app.use("/",userRoutes);
app.use("/posts", postsRoutes);
app.use("/media", mediaRoutes);
app.use("/notifications", notificationsRoutes);

app.get('/', async(req, res) => {
    try {
        const user = req.user;
        return res.render('index', { title: 'Blog', user, userId: req.user.userId });
    } catch (error) {
        console.error(error);
        return res.status(401).redirect('/auth/signin');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});