const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const cors = require('cors');
const { format } = require('date-fns');
const authRoutes = require("./routes/authRoutes")
const postsRoutes = require("./routes/postsRoutes")
const userRoutes = require("./routes/userRoutes")
const multer = require('multer');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    if (req.cookies.token) {
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).redirect('/auth/signin');
            }
            let user = decoded;
            console.log(user.userId);
            return res.render('index', { title: 'Blog', user });
        });
    } else {
        console.log("no token");
        return res.render('index', { title: 'Blog', user: null });
    }
});



app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/users",userRoutes);

app.listen(port, () => {
    console.log(`Server running on localhost:${port}`);
});