const Post = require("../models/postModel");

// GET all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "username");
    const visible = posts.filter((p) => p.user);
    res.json(visible);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE post
const createPost = async (req, res) => {
  try {
    const { caption, image, text } = req.body;
    const finalCaption = caption ?? text ?? "";
    if (!image) return res.status(400).json({ message: "Image required" });
    if (!finalCaption.trim()) {
      return res.status(400).json({ message: "Caption required" });
    }

    const post = await Post.create({
      caption: finalCaption,
      image,
      user: req.user.id,
    });

    const newPost = await post.populate("user", "username");
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LIKE / UNLIKE
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    const updated = await post.populate("user", "username");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE post (owner only)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted", id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE caption (owner only)
const updatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    if (!caption || !caption.trim()) {
      return res.status(400).json({ message: "Caption required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.caption = caption.trim();
    await post.save();
    const updated = await post.populate("user", "username");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPosts, createPost, toggleLike, deletePost, updatePost };
