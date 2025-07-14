const Post = require('../models/Post');
const User = require('../models/User');
const { format } = require('date-fns');
const PostLike = require('../models/PostLike');
const PostRepost = require('../models/PostRepost');
const Notification = require('../models/Notification');
const Follower = require('../models/Follower');
const { formatRelativeTime, formatNumberCompact } = require('../middlware/timeFormate');

const PostsController = {
    // Create a new post
    async create(req, res) {
        try {
            let {
                content,
                media_url = null,
                parent_post_id = null,
                is_draft = false,
                scheduled_at = null,
                published_at = null
            } = req.body;
            
            // Convert empty strings to null
            scheduled_at = scheduled_at?.trim() === '' ? null : scheduled_at;
            published_at = published_at?.trim() === '' ? null : published_at;
            // Validate required fields
            if (!content) {
                return res.status(400).json({ error: 'Content and user_id are required.' });
            }

            // Ensure data types are accurate
            is_draft = Boolean(is_draft);
            parent_post_id = parent_post_id || null;
            media_url = media_url || null;

            // Handle publishing logic
            const isScheduled = scheduled_at && new Date(scheduled_at) > new Date();
            if (!is_draft && !isScheduled && !published_at) {
                published_at = new Date(); // publish immediately
            }

            const post = await Post.createPost(
                content,
                req.user.userId,
                media_url,
                parent_post_id,
                is_draft,
                scheduled_at,
                published_at
            );

            post.user = {
                name: req.user.username,
                avatar: req.user.avatar,
                email: req.user.email,
                id: req.user.userId
            };
            const followers = await Follower.getFollowersByUserId(req.user.userId);
            followers.forEach(async(follower) => {
               await Notification.createNotification(follower.follower_id, req.user.userId, 'new_post', post.id);
            })
            res.status(201).json({ post, message: "Post created successfully" });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Get all posts
    async getAllUserPosts(req, res) {
        try {
            let posts = await Post.getPostsByUser(req.params.id);

            // Get engagement data for each post
            posts = await Promise.all(posts.map(async post => {
                const reactions = await Post.getReactions(post.id);
                const repostCount = await Post.getRepostCount(post.id);
                const userReaction = await Post.getUserReaction(post.id, req.user.userId);
                const hasReposted = await Post.hasReposted(post.id, req.user.userId);

                return {
                    ...post,
                    user: {
                        id: post.user_id,
                        name: post.name,
                        avatar: post.avatar,
                        email: post.email
                    },
                    likes: formatNumberCompact(reactions.likes),
                    dislikes: formatNumberCompact(reactions.dislikes),
                    reposts: formatNumberCompact(repostCount),
                    userReaction,
                    hasReposted
                };
            }));
            res.json(posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Get a single post by ID
    async show(req, res) {
        try {
            const userData = await User.findUser(req.params.name);
            const post = await Post.getPostDataById(req.params.id);
            post.user = {
                id: post.user_id,
                name: post.name,
                avatar: post.avatar,
                email: post.email
            }
            if (!post) return res.status(404).json({ error: 'Post not found' });
            res.render('post/show', { post, user:req.user, userData, userId: req.user.userId, title: "Post" });
        } catch (error) {
            console.error('Error fetching post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Update a post
    async update(req, res) {
    try {
        let {
            content,
            media_url = null,
            is_draft = false,
            scheduled_at = null,
            published_at = null
        } = req.body;
        // Convert empty strings to null
        scheduled_at = scheduled_at?.trim() === '' ? null : scheduled_at;
        published_at = published_at?.trim() === '' ? null : published_at;
        
        // Validate required fields
        if (!content) {
            return res.status(400).json({ error: 'Content is required.' });
        }

        // Ensure data types are accurate
        is_draft = Boolean(is_draft);
        media_url = media_url || null;

        // Handle publishing logic
        const isScheduled = scheduled_at && new Date(scheduled_at) > new Date();
        if (!is_draft && !isScheduled && !published_at) {
            published_at = new Date(); // publish immediately if not draft and not scheduled
        }

        const updatedPost = await Post.updatePost(
            req.params.id,
            content,
            req.user.userId,
            media_url,
            null, // parent_post_id (assuming not used in updates)
            is_draft,
            scheduled_at,
            published_at
        );

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Add user information to the response
        updatedPost.user = {
            name: req.user.username,
            avatar: req.user.avatar,
            email: req.user.email,
            id: req.user.userId
        };

        res.json({ 
            updatedPost, 
            message: "Post updated successfully" 
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},
    // Delete a post
    async destroy(req, res) {
        try {
            const deletedPost = await Post.deletePost(req.params.id);
            if (!deletedPost) return res.status(404).json({ error: 'Post not found' });
            res.json({ message: 'Post deleted successfully.', post: deletedPost });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    //Search Post

    async searchPost(req, res) {
        const { query } = req.query;
        try {
            const results = await Post.searchPost(query);
            results.forEach(post => { // Add formatted date to each post
                post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
            })
            res.render('search_results', {
                title: 'Search Results',
                posts: results,
                query: query,
                user: req.user
            });
        } catch (err) {
            console.log(err);
        }
    },

    async likePost(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user.userId; // From JWT
            const { type } = req.body; // 'like' or 'dislike'
            if (!['like', 'dislike'].includes(type)) {
                return res.status(400).json({ error: 'Invalid reaction type' });
            }
            
            const post = await Post.getPostById(postId);
            const result = await Post.toggleLike(postId, userId, type);
            const reactions = await Post.getReactions(postId);
            if(userId !== post.user_id){
                await Notification.createNotification(post.user_id, userId, type, postId);
            }
            res.json({
                ...result,
                reactions: { reactions, likes: formatNumberCompact(reactions.likes), dislikes: formatNumberCompact(reactions.dislikes) },
                userReaction: await Post.getUserReaction(postId, userId)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to process reaction' });
        }
    },

    async repostPost(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user.userId;

            // Verify the post exists first
            const post = await Post.getPostById(postId);

            if (!post || post.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const result = await Post.toggleRepost(postId, userId);
            const repostCount = await Post.getRepostCount(postId);
            const hasReposted = await Post.hasReposted(postId, userId);
            if(userId !== post.user_id){
                await Notification.createNotification(post.user_id, userId, "repost", postId);
            }
            res.json({
                ...result,
                repostCount: formatNumberCompact(repostCount),
                hasReposted
            });
        } catch (error) {
            console.error("Error in repostPost:", error);
            res.status(500).json({ error: 'Failed to process repost' });
        }
    },

    // In your postsController.js
    async getTrendingPosts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const timePeriod = req.query.period || '24 HOUR';

            // Get trending posts with optimized query
            const trendingPosts = await Post.getTrendingPosts(limit, timePeriod);

            // Get all needed user IDs at once
            const userIds = [...new Set(trendingPosts.map(post => post.user_id))];
            const users = await User.findAll({ where: { id: userIds } });
            const userMap = new Map(users.map(user => [user.id, user]));

            // Get user reactions in bulk if logged in
            let userReactions = new Map();
            let userReposts = new Set();

            if (req.user) {
                const reactions = await PostLike.findAll({
                    where: {
                        post_id: trendingPosts.map(post => post.id),
                        user_id: req.user.id
                    }
                });
                reactions.forEach(r => userReactions.set(r.post_id, r.type));

                const reposts = await PostRepost.findAll({
                    where: {
                        post_id: trendingPosts.map(post => post.id),
                        user_id: req.user.id
                    }
                });
                reposts.forEach(r => userReposts.add(r.post_id));
            }

            // Build response
            const response = trendingPosts.map(post => ({
                ...post,
                user: userMap.get(post.user_id),
                userReaction: userReactions.get(post.id) || null,
                hasReposted: userReposts.has(post.id),
                isFallbackResults: post.is_fallback,
                created_at: post.created_at
            }));

            res.json(response);
        } catch (error) {
            console.error('Error fetching trending posts:', error);
            res.status(500).json({
                error: 'Failed to fetch trending posts',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}


module.exports = PostsController;
