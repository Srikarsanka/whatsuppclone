import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ChatInterface from "./pages/ChatInterface"
import './App.css'

// A wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  // Since your 'token' cookie is set with httpOnly: true in the backend,
  // we can't read it directly via document.cookie in the frontend.
  // However, you are already saving 'userId' in sessionStorage upon successful login!
  const isAuthenticated = sessionStorage.getItem("userId");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App;
