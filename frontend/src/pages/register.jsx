import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./register.css"


const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Account created");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="main">
      <div className="container-1">
        <div className="auth-box">
          <h2 className="heading">Create Account</h2>

          <form onSubmit={handleSubmit} className="createForm">
            <input
              name="username"
              placeholder="Username (start lowercase, include number/symbol)"
              onChange={handleChange}
              pattern="^[a-z](?=.*[0-9._-])[a-z0-9._-]*$"
              title="Must start with lowercase and include a number or symbol (._-)"
              required
            />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
            <button>Create</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
