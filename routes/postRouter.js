const express = require('express');
const multer = require('multer');
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('../controllers/postController');
const { verifyToken } = require('../middlewares/verifyToken');
const router = express.Router();

// Set up multer for file uploads
const upload = multer({
    dest: 'uploads/', // Directory to save uploaded files
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
});

router.get('/posts', getPosts); // Route to get all posts
router.get('/posts/:id', getPostById); // Route to get a post by ID
router.post('/posts', verifyToken, upload.single('thumbnail'), createPost); // Route to create a new post with image upload
router.put('/posts/:id', verifyToken, upload.single('thumbnail'), updatePost); // Route to update a post by ID
router.delete('/posts/:id', verifyToken, deletePost); // Route to delete a post by ID
router.get('/export/csv', async (req, res) => {
    const posts = await Post.find();
    await exportPostsToCSV(posts);
    res.download('posts.csv');
});

module.exports = router;