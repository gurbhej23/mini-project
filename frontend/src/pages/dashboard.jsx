import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png"
import profile from "./profile.jpg"
import "./dashboard.css"

const Dashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]); 
  const [openMenuId, setOpenMenuId] = useState(null);
  const [following, setFollowing] = useState([]);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowing(res.data.following || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await API.get("/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const searchUsers = async (q) => {
    const query = q.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      if (allUsers.length > 0) {
        const lower = query.toLowerCase();
        const filtered = allUsers.filter(
          (u) =>
            u.username?.toLowerCase().includes(lower) ||
            u.email?.toLowerCase().includes(lower)
        );
        setSearchResults(filtered);
      } else {
        const res = await API.get(`/users/search?username=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    searchUsers(value);
  };

  useEffect(() => {
    fetchPosts();
    fetchMe();
    fetchAllUsers();
  }, [token]);

  const getUserIdFromToken = (jwt) => {
    if (!jwt) return null;
    try {
      const payload = jwt.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      const decoded = JSON.parse(atob(padded));
      return decoded.userId || null;
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken(token); 

   
  const toggleLike = async (postId) => {
    try {
      const res = await API.patch(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } catch (err) {
      alert(err.response?.data?.message || "Like failed");
      console.error(err);
    }
  };

  const toggleFollow = async (userId) => {
    try {
      const res = await API.patch(
        `/users/${userId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowing(res.data.following || []);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Follow failed");
      console.error(err);
    }
  };

  const deletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
      console.error(err);
    }
  };

  const toggleMenu = (postId) => {
    setOpenMenuId((prev) => (prev === postId ? null : postId));
  };

  const editPost = async (postId, currentCaption) => {
    const nextCaption = window.prompt("Edit caption", currentCaption || "");
    if (nextCaption === null) return;
    if (!nextCaption.trim()) {
      alert("Caption cannot be empty.");
      return;
    }
    try {
      const res = await API.patch(
        `/posts/${postId}`,
        { caption: nextCaption.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setOpenMenuId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Edit failed");
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="main">
      <div className="container-2">
        <div className="flexTop">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="searchWrap">
            <input
              className="searchInput"
              placeholder="Search username..."
              value={searchText}
              onChange={handleSearchChange}
            />
            {searchText ? (
              <div className="searchDropdown">
                {searchLoading ? (
                  <div className="searchEmpty">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="searchEmpty">No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <div key={u._id} className="searchRow">
                      <div className="searchUser">
                        <div className="searchAvatar">
                          <img src={u.avatar || profile} alt="avatar" />
                        </div>
                        <button
                          className="userLink"
                          onClick={() => {
                            setSearchText("");
                            setSearchResults([]);
                            navigate(`/profile/${u._id}`);
                          }}
                        >
                          {u.username}
                        </button>
                      </div>
                      {u._id !== currentUserId ? (
                        <button
                          className="followBtn"
                          onClick={() => toggleFollow(u._id)}
                        >
                          {following.includes(u._id) ? "Following" : "Follow"}
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <div className="topActions">
            <div className="postMenuWrap">
              <button
                className="menuBtn"
                onClick={() => setShowCreateMenu((v) => !v)}
                aria-label="Create menu"
              >
                +
              </button>
              {showCreateMenu ? (
                <div className="menuDropdown">
                  <button
                    className="menuItem"
                    onClick={() => {
                      setShowCreateMenu(false);
                      navigate("/post");
                    }}
                  >
                    Post
                  </button>
                </div>
              ) : null}
            </div>
            <button
              className="profileBtn"
              onClick={() => navigate(`/profile/${currentUserId}`)}
              disabled={!currentUserId}
            >
              Profile
            </button>
            <button onClick={logout} className="logoutBtn">
              Logout
            </button>
          </div>
        </div>
        <div className="feedCenter">
          <div>
            {posts.map((p) => (
              <div key={p._id} className="postCard">
                <div className="userProfile">
                  <div className="profilePic">
                    <img src={p.user?.avatar || profile} alt="profilePic" />
                  </div>
                  <div className="postHeader">
                    <button
                      className="userLink"
                      onClick={() => {
                        const userId = p.user?._id || p.user;
                        if (userId) navigate(`/profile/${userId}`);
                      }}
                      disabled={!p.user}
                    >
                      {p.user?.username || "Unknown"}
                    </button>
                    {p.user?._id && p.user._id !== currentUserId ? (
                      <button
                        className="followBtn"
                        onClick={() => toggleFollow(p.user._id)}
                      >
                        {following.includes(p.user._id) ? "Following" : "Follow"}
                      </button>
                    ) : null}
                    <div className="postMenuWrap">
                      <button
                        className="menuBtn"
                        onClick={() => toggleMenu(p._id)}
                        aria-label="Post menu"
                      >
                        ...
                      </button>
                      {openMenuId === p._id ? (
                        <div className="menuDropdown">
                          <button
                            className="menuItem"
                            onClick={() => editPost(p._id, p.caption)}
                          >
                            Edit
                          </button>
                          {(() => {
                            const postUserId =
                              typeof p.user === "string" ? p.user : p.user?._id;
                            return postUserId === currentUserId;
                          })() ? (
                            <button
                              className="menuItem danger"
                              onClick={() => {
                                setOpenMenuId(null);
                                deletePost(p._id);
                              }}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                {p.image ? (
                  <div className="postImage">
                    <img src={p.image} alt="post" />
                  </div>
                ) : null}
                {p.caption ? <div className="postCaption">{p.caption}</div> : null}
                <div className="postActions">
                  <button
                    className={p.likes?.includes(currentUserId) ? "likeBtn liked" : "likeBtn"}
                    onClick={() => toggleLike(p._id)}
                  >
                    Like
                  </button>
                  <span className="likeCount">{p.likes?.length || 0} ♥️</span>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
