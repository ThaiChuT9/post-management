const express = require('express');
const multer = require('multer');
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('../controllers/postController');
const { verifyToken } = require('../middlewares/verifyToken');
const router = express.Router();

// Set up multer for file uploads (support multiple images)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB per file
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|jfif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, and JFIF are allowed.'));
    }
});

router.get('/posts', getPosts); // Route to get all posts
router.get('/posts/:id', getPostById); // Route to get a post by ID
router.post('/posts', verifyToken, upload.array('thumbnail', 5 ), createPost); // Route to create a new post with image upload
router.put('/posts/:id', verifyToken, upload.array('thumbnail', 5 ), updatePost); // Route to update a post by ID
router.delete('/posts/:id', verifyToken, deletePost); // Route to delete a post by ID
router.get('/export/csv', async (req, res) => {
    const posts = await Post.find();
    await exportPostsToCSV(posts);
    res.download('posts.csv');
});

module.exports = router;