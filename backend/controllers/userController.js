const User = require("../models/userModel");
const Post = require("../models/postModel");

// GET current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email following avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// FOLLOW / UNFOLLOW
const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentFollowing = user.following || [];
    const isFollowing = currentFollowing.some((id) => id.toString() === targetId);
    if (isFollowing) {
      user.following = currentFollowing.filter((id) => id.toString() !== targetId);
    } else {
      user.following = [...currentFollowing, targetId];
    }

    await user.save();
    res.json({ following: user.following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET user profile with counts + posts
const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("username email following avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    const followersCount = await User.countDocuments({ following: userId });
    const followingIds = user.following || [];
    const followingCount = await User.countDocuments({ _id: { $in: followingIds } });
    const posts = await Post.find({ user: userId }).populate("user", "username");

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || "",
      },
      counts: {
        posts: posts.length,
        followers: followersCount,
        following: followingCount,
      },
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET followers list
const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    const followers = await User.find({ following: userId }).select("username");
    res.json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET following list
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "username");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// SEARCH users by username
const searchUsers = async (req, res) => {
  try {
    const q = String(req.query.username || "").trim();
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("username email avatar");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all users (basic fields)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email avatar");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE avatar for current user
const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: "Avatar required" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.avatar = avatar;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMe,
  toggleFollow,
  getProfile,
  getFollowers,
  getFollowing,
  searchUsers,
  getAllUsers,
  updateAvatar,
};
