import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// FontAwesome Imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEyeSlash, faArrowRight, faPhone, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; // WhatsApp brand icon
import "./login.css"

// Static background chat bubbles and emojis
const backgroundBubbles = [
      { text: "Can't wait to chat! 🔥", top: "75%", left: "20%" },

      { text: "Check this out 🚀", top: "65%", left: "10%", color: "lime" },
      { text: "Wow Nice 😍", top: "85%", left: "10%", color: "lime" },
      { emojiOnly: "✨", top: "20%", left: "45%" },

];

function Login() {
      const [phone, setPhone] = useState("");
      const [password, setPassword] = useState("");
      const [rememberMe, setRememberMe] = useState(true);
      const navigate = useNavigate();

      const [showReply, setShowReply] = useState(false);

      useEffect(() => {
            const interval = setInterval(() => {
                  setShowReply(prev => !prev);
            }, 3000);
            return () => clearInterval(interval);
      }, []);

      const handleLogin = async (e) => {
            e.preventDefault();
            try {
                  const response = await axios.post("http://localhost:3000/api/user/login", { phone, password }, { withCredentials: true });
                  if (response.status === 200) {
                        sessionStorage.setItem("userId", response.data.userId);
                        sessionStorage.setItem("username", response.data.username);
                        alert("Login Successful!");
                        navigate("/");

                  }
                  else {
                        if (response.status === 400) {
                              if (response.message === "Invalid Password") {
                                    alert("Invalid Password")
                              }
                              else if (response.message === "User Not Found.Please Register First") {
                                    alert("User Not Found.Please Register First")
                                    navigate("/register")
                              }
                              else {
                                    alert("Login Failed. Please check your phone or password.")
                              }
                        }

                  }

            } catch (err) {
                  alert("Login Failed. Please check your phone or password.");
            }
      };

      return (
            <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  id="main-loginbox"
            >
                  {/* LEFT SIDE: Smaller Mobile Frame & Static Floating Bubbles */}
                  <div className="left-panel">
                        <div className="glow-circle"></div>

                        {/* Brand Text / Tagline */}
                        <div className="left-panel-text">
                              <h1>Stay <span className="highlight-green">Connected</span><br />Anywhere.</h1>
                              <p>Experience seamless, secure, and fast messaging across all your devices.</p>
                        </div>

                        {/* Static Background Chat Bubbles / Emojis */}
                        {backgroundBubbles.map((bubble, i) => (
                              <div
                                    key={i}
                                    className={bubble.emojiOnly ? "floating-emoji" : "bg-chat-bubble"}
                                    style={{ top: bubble.top, left: bubble.left, backgroundColor: bubble.color }}
                              >
                                    {bubble.text || bubble.emojiOnly}
                              </div>
                        ))}

                        {/* The Mobile Phone Div (Made Smaller & Shifted) */}
                        <motion.div
                              className="mobile-frame"
                              initial={{ y: 50, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ type: "spring", delay: 0.3 }}
                              style={{ marginTop: "200px", marginLeft: "260px" }} // Shifted down and right
                        >
                              <div className="mobile-header">
                                    <div className="mobile-avatar-container">
                                          <div className="mobile-avatar"></div>
                                          <div className="mobile-user-info">
                                                <span className="mobile-name">John Doe</span>
                                                <span className="mobile-status">online</span>
                                          </div>
                                    </div>
                                    <FontAwesomeIcon icon={faPhone} style={{ color: "white", fontSize: "14px" }} />
                              </div>

                              <div className="mobile-chat-area">
                                    <div className="chat-bubble friend-message">
                                          Hey! How are you?<br />
                                          <span className="chat-time">10:30 AM</span>
                                    </div>

                                    <div className="chat-bubble my-message">
                                          I'm good! What about you?<br />
                                          <span className="chat-time">10:31 AM ✓✓</span>
                                    </div>

                                    <AnimatePresence>
                                          {showReply && (
                                                <motion.div
                                                      className="chat-bubble friend-message"
                                                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                                      exit={{ opacity: 0, scale: 0.8, y: 5 }}
                                                >
                                                      All good here! ✌️<br />
                                                      <span className="chat-time">10:32 AM</span>
                                                </motion.div>
                                          )}
                                    </AnimatePresence>

                                    {/* Typing indicator */}
                                    <div className="chat-input-bar">
                                          <span>Type a message...</span>
                                          <div className="send-btn-mock">
                                                <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "10px" }} />
                                          </div>
                                    </div>
                              </div>
                        </motion.div>
                  </div>

                  {/* RIGHT SIDE: Premium Login Form with FontAwesome */}
                  <div className="right-panel">
                        <div className="brand-logo">
                              <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: "45px", color: "#25D366" }} />
                        </div>

                        <h1>Welcome <span className="highlight-green">back!</span></h1>
                        <p className="subtitle">Sign in to continue to WhatsApp Web</p>

                        <form onSubmit={handleLogin} className="login-form">
                              <div className="input-container">
                                    <FontAwesomeIcon icon={faPhone} className="input-icon" />
                                    <input
                                          type="text"
                                          placeholder="Phone Number"
                                          value={phone}
                                          onChange={(e) => setPhone(e.target.value)}
                                          required
                                    />
                              </div>

                              <div className="input-container">
                                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                                    <input
                                          type="password"
                                          placeholder="Password"
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                          required
                                    />
                                    <FontAwesomeIcon icon={faEyeSlash} className="input-icon-right" />
                              </div>

                              <div className="form-actions">
                                    <label className="checkbox-container">
                                          <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                                          <span className="checkmark"></span>
                                          Remember me
                                    </label>
                                    <span className="forgot-password">Forgot password?</span>
                              </div>

                              <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="login-button"
                              >
                                    Log In <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "8px" }} />
                              </motion.button>
                        </form>

                        <p className="register-text">
                              Don't have an account?
                              <span onClick={() => navigate("/register")} className="register-link"> Register here</span>
                        </p>
                  </div>
            </motion.div>
      );
}

export default Login;
