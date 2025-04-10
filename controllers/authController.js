const bcrypt = require('bcryptjs');
const User = require('../models/User');


const signup = async (req, res) => {
    const { name,email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByUsername(name);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    await User.createUser(name, email,hashedPassword);

    res.status(201).redirect('/auth/signin');
}
const login = async (req, res) => {
    const { name, password } = req.body;
    // Find the user
    const user = await User.findByUsername(name);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
     // Store user in session
     req.session.user = user;
     req.session.userId = user.id;
     req.session.username = user.username;
 
    res.redirect('/');
}


const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/signin');
}

module.exports = { signup, login, logout };
