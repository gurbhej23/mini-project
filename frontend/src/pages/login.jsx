import { useState } from "react";
import API from "../services/api";
import "./login.css"; 
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      username: String(data.get("username") || "").trim(),
      password: String(data.get("password") || ""),
    };
    try {
      const res = await API.post("/auth/login", payload);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="main">
      <div className="container">  
        <div className="auth-box">
          <h2 className="head-top">Login into Minigram</h2>

          <div className="form-sec">
            <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              pattern="^[a-z](?=.*[0-9._-])[a-z0-9._-]*$"
              title="Must start with lowercase and include a number or symbol (._-)"
              value={form.username}
              onChange={handleChange}
              required
            />
            <br/>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Link to="/forgot-password">Forgot password?</Link>
            <br/>
            <button type="submit" className="login">Login</button>
            </form>
          </div>

          <div className="signUP"> 
            <Link to="/register">Create an Account</Link> 
          </div>
 
        </div>
      </div>
    </div>
  );
};

export default Login;
