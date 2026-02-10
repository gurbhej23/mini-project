import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./post.css";

const PostPage = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [imageData, setImageData] = useState("");

  const token = localStorage.getItem("token");

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
          const maxWidth = 600;
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageData("");
      return;
    }
    compressImage(file)
      .then((dataUrl) => {
        if (dataUrl.length > 1_200_000) {
          alert("Image too large. Please choose a smaller image.");
          setImageData("");
          return;
        }
        setImageData(dataUrl);
      })
      .catch(async () => {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          if (!dataUrl || dataUrl.length > 1_200_000) {
            alert("Image too large. Please choose a smaller image.");
            setImageData("");
            return;
          }
          setImageData(dataUrl);
        } catch {
          alert("Could not read image. Try a different file.");
          setImageData("");
        }
      });
  };

  const isPostReady = Boolean(imageData) && Boolean(caption.trim());

  const createPost = async () => {
    if (!imageData) {
      alert("Please add an image for your post.");
      return;
    }
    if (!caption.trim()) {
      alert("Please add a caption for your post.");
      return;
    }
    try {
      await API.post(
        "/posts",
        { caption: caption.trim(), image: imageData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Post failed");
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="postPage">
      <div className="postBox">
        <h2>Create Post</h2>
        <input
          id="caption"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <label className="postImagePicker">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          Add Image
        </label>
        {imageData ? (
          <div className="postPreview">
            <img src={imageData} alt="preview" />
          </div>
        ) : null}
        <div className="postActionsRow">
          <button className="ghostBtn" onClick={() => navigate("/dashboard")}>
            Cancel
          </button>
          <button onClick={createPost} disabled={!isPostReady}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
