const express = require('express');
const multer = require('multer');
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('../controllers/postController');
const { verifyToken } = require('../middlewares/verifyToken');
const router = express.Router();

// Set up multer for single image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${unique}.${ext}`);
    }
});
const upload = multer({ storage });



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