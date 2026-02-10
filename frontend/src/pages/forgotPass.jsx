import { useState } from "react";
import API from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/forgotPassword", { email });
      alert("Reset link sent to email");
    } catch (err) {
      alert("Error sending email");
    }
  };

  return (
    <div className="main">
      <div className="container-1">
        <div className="auth-box">
          <h2 className="heading">Forgot Password</h2>
          <form onSubmit={submitHandler} className="createForm">
            <input
              type="email"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button>Send Reset Link</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
