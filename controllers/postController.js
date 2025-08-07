const path = require('path');
const Post = require('../models/Post');
const fs = require('fs').promises;
const emitter = require('../util/eventEmitter');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;
        const newPost = new Post({ title, content, category, thumbnail, author: req.user.id });
        const savedPost = await newPost.save();
        emitter.emit('post:created', savedPost);
        res.status(201).json({ message: 'Post created successfully.', post: savedPost });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post.', error });
    }
};

// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', category } = req.query;
        const filter = category ? { category } : {};
        const posts = await Post.find(filter, null, { __v: 0 })
            .sort({ [sortBy]: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('author', 'username -_id');
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            thumbnail: post.thumbnail,
            author: post.author.username,
            createdAt: post.createdAt.toISOString()
        }));
        res.status(200).json(formattedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts.', error });
    }
};

// Get a post by ID
exports.getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const postItem = await Post.findById(postId).populate('author', 'username');
        if (!postItem) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(200).json(postItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post.', error });
    }
};

// Update a post by ID
exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const postItem = await Post.findById(postId);
        if (!postItem) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Kiểm tra quyền
        if (postItem.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this post.' });
        }

        const { title, content, category } = req.body;

        // Cập nhật nội dung
        if (title) postItem.title = title;
        if (content) postItem.content = content;
        if (category) postItem.category = category;

        // Cập nhật thumbnail nếu có file mới
        if (req.file?.filename) {
            // Xóa ảnh cũ nếu tồn tại
            if (postItem.thumbnail) {
                const oldPath = path.join(__dirname, '../uploads', postItem.thumbnail);
                try {
                    await fs.unlink(oldPath);
                } catch (err) {
                    console.warn('⚠️ Không thể xóa thumbnail cũ:', err.message);
                }
            }
            postItem.thumbnail = `/uploads/${req.file.filename}`;
        }

        // Lưu bài viết đã chỉnh sửa
        const updatedPost = await postItem.save();

        // Populate tác giả để phản hồi đúng
        await updatedPost.populate('author', 'username -_id');

        // Emit event
        emitter.emit('post:updated', updatedPost);

        res.status(200).json({
            message: 'Post updated successfully.',
            post: updatedPost,
        });
    } catch (error) {
        console.error('❌ Error updating post:', error);
        res.status(500).json({ message: 'Error updating post.', error });
    }
};

// Delete a post by ID
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const postItem = await Post.findById(postId);
        if (!postItem) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        if (postItem.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this post.' });
        }
        if (postItem.thumbnail) {
            const filePath = path.join(__dirname, '../uploads', postItem.thumbnail);
            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.error('Error deleting thumbnail:', err);
            }
        }
        await Post.findByIdAndDelete(postId);
        // Emit an event after deleting the post
        emitter.emit('post:deleted', postId);
        res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post.', error });
    }
};
