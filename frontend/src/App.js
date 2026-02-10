import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgotPass";
import ResetPassword from "./pages/resetPass";
import Dashboard from "./pages/dashboard";
import PostPage from "./pages/post";
import ProfilePage from "./pages/profile";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/post"
          element={
            <PrivateRoute>
              <PostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
