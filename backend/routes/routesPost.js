const express = require("express");
const router = express.Router();
const { getPosts, createPost, toggleLike, deletePost, updatePost } = require("../controllers/postController");
const auth = require("../middlewares/authMiddle"); 

router.get("/", auth, getPosts);
router.post("/", auth, createPost);
router.patch("/:id/like", auth, toggleLike);
router.delete("/:id", auth, deletePost);
router.patch("/:id", auth, updatePost);

module.exports = router;
