import "./register.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faGlobe, faUserGroup, faVoicemail } from '@fortawesome/free-solid-svg-icons';
import {
      faPhone,
      faEnvelope,
      faCalendarDays,
      faLock
} from '@fortawesome/free-solid-svg-icons';

import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

function Register() {
      // Form states available for your form
      const [username, setUsername] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [repassword, setrepassword] = useState("");
      const [dob, setdob] = useState("");
      const [phone, setPhone] = useState("");

      const navigate = useNavigate();

      const handleRegisteration = async (e) => {
            e.preventDefault();
            if (password !== repassword) {
                  alert("Password and re-password do not match.");
                  return;
            }
            try {
                  const response = await axios.post("http://localhost:3000/api/user/register", { username, email, password, repassword, dob, phone });
                  if (response.status === 200) {
                        alert("Registration Successful!")
                        navigate("/login")
                  }
                  else {
                        alert("Registration Failed.Please check your inputs")
                  }
            } catch (e) {
                  const errorMsg = e.response?.data?.message || e.message;
                  alert("Registration Failed: " + errorMsg);
            }
      }

      return (
            <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  id="main-regbox"
            >

                  <div className="reg-left-panel">
                        <div className="reg-brand-logo">
                              <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: "45px", color: "#25D366" }} />
                        </div>

                        <h1>Create an <span className="reg-highlight-green">Account</span></h1>
                        <p className="reg-subtitle">Join us and start messaging your friends.</p>
                        <form onSubmit={handleRegisteration} className="reg-form">
                              {/*USERNAME */}
                              <div className="input-container">
                                    <FontAwesomeIcon icon={faUserGroup} className="input-icon" />
                                    <input type="text" placeholder="Username" className="input-right" value={username} onChange={(e) => setUsername(e.target.value)} required />
                              </div>
                              <div className="input-container">
                                    <FontAwesomeIcon icon={faPhone} className="input-icon" />
                                    <input type="text" placeholder="Phone Number" className="input-right" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                              </div>
                              <div className="input-container">
                                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                                    <input type="text" placeholder="Email -Id" className="input-right" value={email} onChange={(e) => setEmail(e.target.value)} required />
                              </div>
                              <div className="input-container">
                                    <FontAwesomeIcon icon={faCalendarDays} className="input-icon" />
                                    <input type="date" placeholder="Date of Birth" className="input-right" value={dob} onChange={(e) => setdob(e.target.value)} required />
                              </div>

                              <div className="input-container">
                                    <FontAwesomeIcon icon={faShieldHalved} className="input-icon" />
                                    <input type="password" placeholder="Password" className="input-right" value={password} onChange={(e) => setPassword(e.target.value)} required />
                              </div>

                              <div className="input-container">
                                    <FontAwesomeIcon icon={faShieldHalved} className="input-icon" />
                                    <input type="password" placeholder="Confirm Password" className="input-right" value={repassword} onChange={(e) => setrepassword(e.target.value)} required />
                              </div>

                              <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    className="reg-submit-btn"
                              >
                                    Create Account
                              </motion.button>
                        </form>

                        {/* ----------------------------------------------- */}

                        <p style={{ marginTop: "15px", color: "#64748b", fontSize: "14px", textAlign: "center" }}>
                              Already have an account?
                              <span onClick={() => navigate("/login")} style={{ color: "#00a884", cursor: "pointer", fontWeight: "600" }}> Log in</span>
                        </p>
                  </div>

                  {/* RIGHT PANEL: Attractive & Impressive Design */}
                  <div className="reg-right-panel">
                        <div className="deco-ring"></div>

                        {/* Floating Card 1 */}
                        <motion.div
                              className="float-card"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                              style={{ top: "15%", left: "10%" }}
                        >
                              <div className="card-icon-wrap">
                                    <FontAwesomeIcon icon={faShieldHalved} />
                              </div>
                              <div className="card-text-wrap">
                                    <span className="card-text-title">End-to-End</span>
                                    <span className="card-text-sub">Fully Secured</span>
                              </div>
                        </motion.div>

                        {/* Floating Card 2 */}
                        <motion.div
                              className="float-card"
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                              style={{ bottom: "25%", right: "10%" }}
                        >
                              <div className="card-icon-wrap">
                                    <FontAwesomeIcon icon={faGlobe} />
                              </div>
                              <div className="card-text-wrap">
                                    <span className="card-text-title">Connect</span>
                                    <span className="card-text-sub">Globally</span>
                              </div>
                        </motion.div>

                        {/* Floating Card 3 */}
                        <motion.div
                              className="float-card"
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                              style={{ top: "40%", left: "5%" }}
                        >
                              <div className="card-icon-wrap">
                                    <FontAwesomeIcon icon={faUserGroup} />
                              </div>
                              <div className="card-text-wrap">
                                    <span className="card-text-title">Community</span>
                                    <span className="card-text-sub">Millions of users</span>
                              </div>
                        </motion.div>

                        <div className="reg-right-content">
                              <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                              >
                                    <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: "100px", color: "white", marginBottom: "20px", filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.2))" }} />
                              </motion.div>

                              <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                              >
                                    Join the<br />Community.
                              </motion.h2>

                              <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                              >
                                    Experience the fastest, most reliable messaging platform across all your devices.
                              </motion.p>
                        </div>
                  </div>
            </motion.div>
      )
}

export default Register;
