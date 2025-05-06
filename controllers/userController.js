const Post = require('../models/Post');
const User = require('../models/User');

const userController = {
    // Create a new post
    async profile(req, res) {
        try {
            const userData = await User.findById(req.params.id);
            console.log(userData);
            res.status(201).render("profile",{ user:req.user,userData, title: "profile",userId: req.user.userId });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async updateProfile(req,res) {
        try {
            const avatar = req.file.path;
            const avatar_public_id = req.file.filename;
            const updatedUser = await User.updateAvatar(req.params.id, avatar, avatar_public_id);
            res.json({ updatedUser, message: "User updated successfully" });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = userController;