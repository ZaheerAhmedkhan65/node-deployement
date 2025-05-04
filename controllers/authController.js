const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure email transporter (add this at the top)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


const signup = async (req, res) => {
    const { name,email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findUser(name);
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
    const user = await User.findUser(name);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
     // Store user in session
    // Generate JWT with role
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.name,
                    role: user.role,
                    email: user.email
                }, 
                process.env.JWT_SECRET , 
                { expiresIn: '7d' }
            );
            
            // Set the token in a cookie
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 
            });
 
    res.redirect('/');
}
const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/signin');
}
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).render('forgot-password', { 
                error: 'No account with that email exists.' 
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        // Create a Date object and format it for MySQL
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        
        await User.updateUser(user.id, { 
            resetToken,
            resetTokenExpiry: resetTokenExpiry.toISOString().slice(0, 19).replace('T', ' ')
            // Formats to: "YYYY-MM-DD HH:MM:SS"
        });

        console.log("email : ",email);

        // Send email with reset link
        const resetUrl = `https://${req.headers.host}/auth/reset-password/${resetToken}`;
        
        await transporter.sendMail({
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            html: `
                <p>You requested a password reset for your BlogPosts account.</p>
                <p>Click this link to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.render('forgot-password', { 
            title: 'Forgot Password',
            user: req.session.user || null,
            message: 'Password reset email sent. Check your inbox.' 
        });
    } catch (error) {
        console.error(error);
        res.render('forgot-password', { 
            title: 'Forgot Password',
            user: req.session.user || null,
            error: 'Error sending reset email. Please try again.' 
        });
    }
};

const refreshToken = async (req, res) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        
        // Verify user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }
        
        // Issue a new token with renewed expiration
        const newToken = jwt.sign(
            { 
                userId: decoded.userId, 
                username: decoded.username,
                role: user.role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.cookie('token', newToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.json({ success: true });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

const resetPassword = async (req, res) => {
    const { token } = req.params;
    
    try {
        // Find user by token and check expiry
        const user = await User.findByResetToken(token);
        
        if (user && user.resetTokenExpiry < Date.now()) {
            res.render('reset-password', { 
                title: 'Reset Password',
                user: req.session.user || null,
                token,
                valid: true
            });
        }else{
            res.redirect("/auth/signup")
        }
    } catch (error) {
        console.error(error);
        res.redirect("/auth/signup")
    }
};
const updatePassword = async (req, res) => {
    const { token, password } = req.body;
    
    try {
        // Find user by token and check expiry
        const user = await User.findByResetToken(token);
        
        if (!user) {
            return res.redirect("/auth/signup");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        await User.updateUserPassword(user.id, { 
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        });

        res.render('signin', { 
            title: 'Sign In',
            user: req.session.user || null,
            message: 'Password updated successfully. Please sign in.' 
        });
    } catch (error) {
        console.error(error);
        res.redirect("/auth/signup");
    }
};
module.exports = { signup, login, logout, forgotPassword, resetPassword, updatePassword, refreshToken };
