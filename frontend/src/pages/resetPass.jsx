import { useState } from "react";
import API from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/auth/resetPassword/${token}`, { password });
      alert(res.data.message); // "Password reset successful"
      navigate("/"); // redirect to login
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="main">
      <div className="container-1">
        <div className="auth-box">
          <h2 className="heading">Reset Password</h2>
          <form onSubmit={submitHandler} className="createForm">
            <input
              type="password"
              placeholder="New password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Reset</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
