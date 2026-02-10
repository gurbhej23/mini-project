import { useEffect, useState } from "react";
import profilePlaceholder from "./profile.jpg";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./profile.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [following, setFollowing] = useState([]);
  const [meId, setMeId] = useState(null);
  const [myAvatar, setMyAvatar] = useState("");
  const [showList, setShowList] = useState(false);
  const [listType, setListType] = useState("followers");
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/users/${id}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
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
      setMeId(res.data._id || null);
      setMyAvatar(res.data.avatar || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchMe();
  }, [id]);

  const toggleFollow = async () => {
    try {
      const res = await API.patch(
        `/users/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowing(res.data.following || []);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Follow failed");
      console.error(err);
    }
  };

  const openList = async (type) => {
    setListType(type);
    setShowList(true);
    setListLoading(true);
    try {
      const res = await API.get(`/users/${id}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const toggleFollowUser = async (userId) => {
    try {
      const res = await API.patch(
        `/users/${userId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowing(res.data.following || []);
    } catch (err) {
      alert(err.response?.data?.message || "Follow failed");
      console.error(err);
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result;
        if (!src) {
          reject(new Error("File read failed"));
          return;
        }
        const img = new Image();
        img.onload = () => {
          const maxWidth = 300;
          const scale = Math.min(1, maxWidth / img.width);
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = src;
      };
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file)
      .then((dataUrl) => {
        if (dataUrl.length > 400_000) {
          alert("Avatar too large. Choose a smaller image.");
          return;
        }
        return API.patch(
          "/users/me/avatar",
          { avatar: dataUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((res) => {
        if (res?.data?.avatar) {
          setMyAvatar(res.data.avatar);
          if (profile?.user?._id === meId) {
            setProfile((prev) => ({
              ...prev,
              user: { ...prev.user, avatar: res.data.avatar },
            }));
          }
        }
      })
      .catch(async () => {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          if (!dataUrl || dataUrl.length > 400_000) {
            alert("Avatar too large. Choose a smaller image.");
            return;
          }
          const res = await API.patch(
            "/users/me/avatar",
            { avatar: dataUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res?.data?.avatar) {
            setMyAvatar(res.data.avatar);
            if (profile?.user?._id === meId) {
              setProfile((prev) => ({
                ...prev,
                user: { ...prev.user, avatar: res.data.avatar },
              }));
            }
          }
        } catch {
          alert("Could not read image.");
        }
      });
  };

  if (!profile) {
    return (
      <div className="profilePage">
        <div className="profileBox">Loading...</div>
      </div>
    );
  }

  const isFollowing = following.includes(profile.user._id);

  return (
    <div className="profilePage">
      <div className="profileBox">
        <div className="profileHeader">
          <div className="profileAvatarWrap">
            <img
              className="profileAvatar"
              src={profile.user.avatar || myAvatar || profilePlaceholder}
              alt="avatar"
            />
            {profile.user._id === meId ? (
              <label className="avatarBtn">
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                Change
              </label>
            ) : null}
          </div>
          <div className="profileInfo">
            <h2>{profile.user.username}</h2>
          </div>
          <div className="profileActions">
            <button className="ghostBtn" onClick={() => navigate("/dashboard")}>
              Back
            </button>
            <button onClick={toggleFollow}>
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        <div className="profileStats">
          <div className="statItem">
            <div className="statNum">{profile.counts.posts}</div>
            <div className="statLabel">Posts</div>
          </div>
          <button className="statBtn" onClick={() => openList("followers")}>
            <div className="statNum">{profile.counts.followers}</div>
            <div className="statLabel">Followers</div>
          </button>
          <button className="statBtn" onClick={() => openList("following")}>
            <div className="statNum">{profile.counts.following}</div>
            <div className="statLabel">Following</div>
          </button>
        </div>

        <div className="profileGrid">
          {profile.posts.map((p) => (
            <div key={p._id} className="gridItem">
              <img src={p.image} alt="post" />
            </div>
          ))}
        </div>
      </div>

      {showList ? (
        <div className="listOverlay" onClick={() => setShowList(false)}>
          <div className="listModal" onClick={(e) => e.stopPropagation()}>
            <div className="listHeader">
              <h3>{listType === "followers" ? "Followers" : "Following"}</h3>
              <button className="ghostBtn" onClick={() => setShowList(false)}>
                Close
              </button>
            </div>
            {listLoading ? (
              <div className="listLoading">Loading...</div>
            ) : (
              <div className="listBody">
                {listUsers.length === 0 ? (
                  <div className="listEmpty">No users yet.</div>
                ) : (
                  listUsers.map((u) => (
                    <div key={u._id} className="listRow">
                      <button
                        className="userLink"
                        onClick={() => {
                          setShowList(false);
                          navigate(`/profile/${u._id}`);
                        }}
                      >
                        {u.username}
                      </button>
                      {u._id !== meId ? (
                        <button
                          className="followBtn"
                          onClick={() => toggleFollowUser(u._id)}
                        >
                          {following.includes(u._id) ? "Following" : "Follow"}
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePage;
