import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ChatInterface from "./pages/ChatInterface"
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}
export default App;
