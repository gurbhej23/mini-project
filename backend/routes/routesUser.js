const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddle");
const {
  getMe,
  toggleFollow,
  getProfile,
  getFollowers,
  getFollowing,
  searchUsers,
  getAllUsers,
  updateAvatar,
} = require("../controllers/userController");

router.get("/me", auth, getMe);
router.patch("/me/avatar", auth, updateAvatar);
router.get("/all", auth, getAllUsers);
router.get("/search", auth, searchUsers);
router.get("/:id/profile", auth, getProfile);
router.get("/:id/followers", auth, getFollowers);
router.get("/:id/following", auth, getFollowing);
router.patch("/:id/follow", auth, toggleFollow);

module.exports = router;
