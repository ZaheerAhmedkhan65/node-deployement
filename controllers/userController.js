const Post = require('../models/Post');
const User = require('../models/User');
const Follower = require('../models/Follower');
const Notification = require('../models/Notification');
const {formateDate, formatRelativeTime, formatNumberCompact} = require('../middlware/timeFormate');


const userController = {
    // Create a new post
    async profile(req, res) {
    try {
        let userData = await User.findUser(req.params.name);
        if(!userData && req.user) {  // Also check if req.user exists
            userData = await User.findUser(req.user.name);
        }

        // If still no user data found
        if(!userData) {
            return res.status(404).render('error', { 
                message: 'User not found',
                title: 'User Not Found'
            });
        }

        userData.created_at = formateDate(userData.created_at);
        const posts = await Post.getPostsCountByUser(userData.id);
        const followers = await Follower.getFollowersCountByUserId(userData.id);
        const following = await Follower.getFollowingsCountByUserId(userData.id);
        
        userData.posts = formatNumberCompact(posts);
        userData.followers_count = formatNumberCompact(followers);
        userData.following_count = formatNumberCompact(following);
        
        res.status(200).render("user/profile", { 
            user: req.user,
            userData, 
            title: "profile",
            userId: req.user ? req.user.userId : null 
        });
    } catch (error) {
        console.error('Error getting user profile data:', error);
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
    },

    async suggestedUser(req, res) {
        try {
            const currentUserId = req.user.userId; // Assuming you have user in request from auth middleware
            const suggestedUsers = await User.getSuggestedUsers(currentUserId);
            
            // Add isFollowing flag for frontend
            const usersWithFollowingStatus = suggestedUsers.map(user => ({
                ...user,
                isFollowing: false
            }));

            res.json(usersWithFollowingStatus);
        } catch (error) {
            console.error('Error getting suggested users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async followUser(req, res) {
        try {
            const followerId = req.user.userId;
            const followingId = req.params.id;
            
            const isFollowing = await Follower.getFollowersByUserIdAndFollowerId(followerId, followingId);
            
            if (isFollowing.length > 0) {
                return res.status(400).json({ error: 'You are already following this user' });
            }

            const follow = await Follower.createFollower(followerId, followingId);
            await Notification.createNotification(followingId, followerId, 'follow');
            
            res.json({ follow, message: "User followed successfully" });
        } catch (error) {
            console.error('Error following user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async unfollowUser(req, res) {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.id;

        const isFollowing = await Follower.getFollowersByUserIdAndFollowerId(followerId, followingId);
        if (isFollowing.length === 0) {
            return res.status(400).json({ error: 'You are not following this user' });
        }

        const unfollow = await Follower.deleteFollower(followerId, followingId);
        res.json({ unfollow, message: "User unfollowed successfully" });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},

    async followers(req, res) {
        try {
            let following = await Follower.getFollowersByUserId(req.params.id);
            following = following.map(following => ({
                ...following,
                followed_at: formatRelativeTime(following.followed_at)
            }))
            res.json(following);
        } catch (error) {
            console.error('Error getting follows:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async following(req, res) {
        try {
            let followings = await Follower.getFollowingsByUserId(req.params.id);
            followings = followings.map(follower => ({
                ...follower,
                followed_at: formateDate(follower.followed_at)
            }))
            res.json(followings);
        } catch (error) {
            console.error('Error getting followers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async notifications(req, res) {
        try {
            let notifications = await Notification.getNotificationsByUserId(req.params.id);
            notifications = notifications.map(notification => ({
                ...notification,
                created_at: formatRelativeTime(notification.created_at)
            }))
            res.json(notifications);
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
}

module.exports = userController;