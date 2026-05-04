import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './chatinterface.css';
import { io } from 'socket.io-client';

import { faMagnifyingGlass, faUser, faPaperPlane, faUserGroup, faRightFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
function ChatInterface() {
      const navigate = useNavigate();
      const login_id = sessionStorage.getItem("userId");
      const username = sessionStorage.getItem("username");


      const [activeChat, setActiveChat] = useState(null);
      const [messages, setMessages] = useState([])
      const [searchQuery, setSearchQuery] = useState('')
      const [searchResults, setSearchResults] = useState([])
      const [newMessage, setNewMessage] = useState('')
      const [openprofile, setopenprofile] = useState(false)
      const [email, setemail] = useState("")
      const [dob, setdob] = useState("")
      const [phone, setphone] = useState("")



      const [socket, setSocket] = useState(null);
      const [unreadCounts, setUnreadCounts] = useState({}); // the below state tracks unread messages per user


      // -----------------------------------------------------------
      // The below code fetches all previous conversations on page load
      // and pre-populates the contact panel
      // -----------------------------------------------------------
      // -----------------------------------------------------------
      // The below function fetches our past conversations
      // -----------------------------------------------------------
      const fetchConversations = async () => {
            try {
                  // the below code fetches all users we have talked to before
                  const response = await axios.get(
                        "https://whatsuppbackend.onrender.com/api/message/conversations/all",
                        { withCredentials: true }
                  );

                  // the below code pre-populates the contact panel with our conversations
                  setSearchResults(response.data);

            } catch (e) {
                  console.log("Error fetching conversations:", e);
            }
      };

      useEffect(() => {
            fetchConversations();
      }, []); // empty array means this runs only ONCE when the page first loads

      const toggleLike = async (id, isCurrentlyFriend) => {
            // Optimistic UI update: instantly toggle the heart
            setSearchResults(prev => prev.map(user =>
                  user._id === id ? { ...user, isFriend: !isCurrentlyFriend } : user

            ));
            fetchConversations();

            if (!isCurrentlyFriend) {
                  // Call backend to add them as a friend
                  try {
                        await axios.post(`https://whatsuppbackend.onrender.com/api/user/addfriend/${id}`, {}, { withCredentials: true });
                  } catch (err) {
                        console.error("Failed to add friend", err);
                        // Revert if it fails
                        setSearchResults(prev => prev.map(user =>
                              user._id === id ? { ...user, isFriend: isCurrentlyFriend } : user
                        ));
                  }
            } else {
                  // Call backend to remove them as a friend
                  try {
                        await axios.post(`https://whatsuppbackend.onrender.com/api/user/removefriend/${id}`, {}, { withCredentials: true });
                  } catch (err) {
                        console.error("Failed to remove friend", err);
                        // Revert if it fails
                        setSearchResults(prev => prev.map(user =>
                              user._id === id ? { ...user, isFriend: isCurrentlyFriend } : user
                        ));
                  }
            }
      }

      const handleSearchQueryChange = async (e) => {
            const query = e.target.value;
            setSearchQuery(query);

            if (!query.trim()) {
                  // if search is cleared, fetch the old conversations again instead of showing nothing
                  fetchConversations();
                  return;
            }

            try {
                  const response = await axios.get(`https://whatsuppbackend.onrender.com/api/user/search/${query}`, { withCredentials: true });
                  setSearchResults(response.data);
            } catch (err) {
                  setSearchResults([]);
            }
      }

      // -----------------------------------------------------------
      // The below code is for handling the sending of messages
      // -----------------------------------------------------------
      const handlemessage = async (receiverId) => {

            if (!receiverId || !newMessage.trim()) return;

            try {
                  // 1. Send the message to the database via API
                  const response = await axios.post(
                        `https://whatsuppbackend.onrender.com/api/message/send/${receiverId}`,
                        { message: newMessage },
                        { withCredentials: true }
                  );


                  // 2. The below code is for preparing the socket.io data
                  const messageData = {
                        receiverId: activeChat._id,
                        senderId: login_id,
                        message: newMessage,
                        createdAt: response.data.data.createdAt, // Send timestamp via socket
                  };


                  // 3. The below code is used to check if the socket is connected and send the message instantly
                  if (socket) {
                        socket.emit('send_message', messageData);
                  }


                  // 4. The below code adds the sent message to OUR OWN screen immediately
                  setMessages((prevMessages) => [
                        ...prevMessages,
                        { sender: login_id, message: newMessage, createdAt: response.data.data.createdAt }
                  ]);


                  // 5. Clear the input box after sending
                  setNewMessage("");

            }
            catch (e) {
                  console.log("Error sending message:", e);
            }
      }


      // -----------------------------------------------------------
      // The below code is for fetching the chat history
      // whenever you click on a different contact
      // -----------------------------------------------------------
      useEffect(() => {

            // the below code checks if an active chat is selected
            if (!activeChat) return;

            const fetchMessages = async () => {
                  try {
                        // the below code fetches all old messages between you and the selected user
                        const response = await axios.get(
                              `https://whatsuppbackend.onrender.com/api/message/${activeChat._id}`,
                              { withCredentials: true }
                        );

                        // the below code stores the fetched messages into the messages state
                        setMessages(response.data);

                  } catch (e) {
                        console.log("Error fetching messages:", e);
                  }
            };

            fetchMessages();

      }, [activeChat]); // runs every time you click a new contact
      // -----------------------------------------------------------
      // The below code is for the socket connection and listening
      // -----------------------------------------------------------
      useEffect(() => {

            // 1. Connect to the backend server
            const newSocket = io('https://whatsuppbackend.onrender.com');
            setSocket(newSocket);

            // 2. Tell the backend server our user ID to join our personal room
            if (login_id) {
                  newSocket.emit('setup', login_id);
            }

            // 3. The below code is used to listen for INCOMING messages from the socket
            newSocket.on("receive_message", (incomingMessage) => {

                  // the below code gets the ID of who sent the message
                  const whoSentIt = incomingMessage.senderId;

                  // check the current activeChat using the DOM (workaround for stale closure)
                  const currentChatId = document.getElementById("active-chat-id")?.dataset?.id;

                  if (currentChatId === whoSentIt) {
                        // the below code adds the message if we are already in this chat
                        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
                  } else {
                        // the below code increments the unread badge count for that sender
                        setUnreadCounts((prev) => ({
                              ...prev,
                              [whoSentIt]: (prev[whoSentIt] || 0) + 1,
                        }));
                  }

            });


            // 4. The below code is to clean the connection when we leave the page
            return () => {
                  newSocket.disconnect();
            };

      }, [login_id]);

      const messageEndRef = useRef(null);

      // Auto-scroll to the bottom whenever messages change
      useEffect(() => {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [messages]);

      // the below code is for the profile

      const porfile = async () => {
            try {
                  const response = await axios.get("https://whatsuppbackend.onrender.com/api/user/profile", { withCredentials: true });
                  setemail(response.data.data.email)
                  setdob(response.data.data.dob)
                  setphone(response.data.data.phone)
                  setopenprofile(true)
            }
            catch (e) {
                  console.log(e)
            }
      }

      return (
            <>
                  {/* the below hidden element stores the active chat ID so the socket listener can read it */}
                  <div id="active-chat-id" data-id={activeChat?._id || ""} style={{ display: "none" }} />
                  <div className="app-layout">
                        <div className="main-app">
                              <div id="left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
                                          <div title="Friends" style={{ 
                                                cursor: "pointer",
                                                backgroundColor: "#111b21",
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center" 
                                          }}>
                                                <img src={"https://res.cloudinary.com/djha4r2ys/image/upload/v1777795392/f6eb0a7f-fed8-457a-af2c-59e3d8811674.png"} style={{ width: "22px", height: "22px", objectFit: "contain" }} alt="WhatsApp" />
                                          </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
                                          <div title="Profile" onClick={porfile} style={{
                                                cursor: "pointer",
                                                backgroundColor: "#111b21",
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center"
                                          }}>
                                                <FontAwesomeIcon icon={faUser} style={{ fontSize: "20px", color: "white" }} />
                                          </div>
                                          <div title="Logout" style={{ cursor: "pointer" }} onClick={() => {
                                                sessionStorage.clear();
                                                navigate('/login');
                                          }}>
                                                <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: "20px", color: "rgba(255,255,255,0.7)" }} />
                                          </div>
                                    </div>
                              </div>
                              <div id="right">
                                    <div id="searchbar">
                                          <span>
                                                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: "20px", color: "white", marginLeft: "10px" }} />

                                          </span>
                                          <input type="text" placeholder="Search chats and friends" value={searchQuery} onChange={handleSearchQueryChange} />



                                    </div>
                                    <div id="contacts">
                                          {
                                                searchResults.map((user) => {
                                                      return (
                                                            <div
                                                                  className={`contact-row ${activeChat?._id === user._id ? 'active-chat' : ''}`}
                                                                  key={user._id}
                                                                  onClick={() => {
                                                                        setActiveChat(user);
                                                                        // the below code resets the unread count for this user when we open their chat
                                                                        setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));
                                                                  }}
                                                            >
                                                                  <div className="contact-avatar">
                                                                        <FontAwesomeIcon icon={faUser} style={{ fontSize: "20px", color: "white" }} />
                                                                  </div>
                                                                  <div className="contact-info">
                                                                        <p>{user.displayName || user.phone}</p>
                                                                  </div>
                                                                  {user.isFriend ? (
                                                                        <div
                                                                              className="contact-action"
                                                                              onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleLike(user._id, true);
                                                                              }}
                                                                        >
                                                                              ❤️
                                                                        </div>
                                                                  ) : (
                                                                        <div
                                                                              className="contact-action"
                                                                              onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleLike(user._id, false);
                                                                              }}
                                                                        >
                                                                              🤍
                                                                        </div>
                                                                  )}

                                                                  {/* the below code shows the green unread badge if there are unread messages */}
                                                                  {unreadCounts[user._id] > 0 && (
                                                                        <div className="unread-badge">
                                                                              {unreadCounts[user._id]}
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      )

                                                })
                                          }



                                    </div>
                              </div>

                        </div>
                        <div className="classInterface">
                              {activeChat ? (
                                    <>
                                          <div id="chat-header">
                                                <div style={{ backgroundColor: "white", borderRadius: "50%", width: "40px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "15px" }}>
                                                      <FontAwesomeIcon icon={faUser} style={{ fontSize: "20px", color: "#202c33" }} />
                                                </div>
                                                <h3>{activeChat.displayName}</h3>
                                          </div>
                                          <div id="chat-content">
                                                {
                                                      messages.map((msg, index) => {
                                                            // If the sender matches your login_id, it is YOUR message
                                                            // Otherwise, it is THEIR message
                                                            const messageClass = msg.sender === login_id ? "sent" : "received";

                                                            // Function to format the timestamp
                                                            const timeString = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                                                            return (
                                                                  <div key={index} className={messageClass}>
                                                                        <span className="message-text">{msg.message}</span>
                                                                        <span className="message-time">{timeString}</span>
                                                                  </div>
                                                            )
                                                      })
                                                }
                                                <div ref={messageEndRef} />
                                          </div>
                                          <div id="message-input">
                                                <input
                                                      type="text"
                                                      placeholder="Type a message"
                                                      value={newMessage}
                                                      onChange={(e) => setNewMessage(e.target.value)}
                                                />
                                                <button onClick={(e) => { handlemessage(activeChat._id) }}>
                                                      <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "20px", color: "#8696a0" }} />
                                                </button>
                                          </div>
                                    </>
                              ) : (
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "#8696a0", backgroundColor: "#222e35" }}>
                                          <h1 style={{ fontWeight: 300, marginBottom: "15px" }}>WhatsApp Web</h1>
                                          <p>Select a chat to start messaging.</p>
                                    </div>
                              )}
                        </div>
                  </div>

                  {/* Profile Overlay */}
                  {openprofile && (
                        <div style={{
                              position: "fixed",
                              top: 0, left: 0, width: "100vw", height: "100vh",
                              backgroundColor: "rgba(0,0,0,0.6)",
                              display: "flex", justifyContent: "center", alignItems: "center",
                              zIndex: 1000
                        }}>
                              <div style={{
                                    backgroundColor: "#111b21",
                                    color: "white",
                                    width: "350px",
                                    padding: "30px",
                                    borderRadius: "10px",
                                    position: "relative",
                                    boxShadow: "0px 4px 15px rgba(0,0,0,0.5)"
                              }}>
                                    <div
                                          onClick={() => setopenprofile(false)}
                                          style={{ position: "absolute", top: "15px", right: "20px", cursor: "pointer" }}
                                    >
                                          <FontAwesomeIcon icon={faXmark} style={{ fontSize: "20px", color: "#8696a0" }} />
                                    </div>
                                    <h2 style={{ textAlign: "center", marginBottom: "20px", fontWeight: "400" }}>Profile</h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px", fontSize: "16px" }}>
                                          <div><strong>Username:</strong> {username}</div>
                                          <div><strong>Email:</strong> {email || "N/A"}</div>
                                          <div><strong>Phone:</strong> {phone || "N/A"}</div>
                                          <div><strong>DOB:</strong> {dob || "N/A"}</div>
                                    </div>
                                    <button
                                          onClick={async () => {
                                                const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
                                                if (!confirmed) return;
                                                try {
                                                      await axios.delete("https://whatsuppbackend.onrender.com/api/user/delete", { withCredentials: true });
                                                      sessionStorage.clear();
                                                      alert("Account deleted successfully.");
                                                      navigate("/login");
                                                } catch (e) {
                                                      console.log(e);
                                                      alert("Failed to delete account.");
                                                }
                                          }}
                                          style={{
                                                marginTop: "25px",
                                                width: "100%",
                                                padding: "10px",
                                                backgroundColor: "#e74c3c",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontSize: "15px",
                                                cursor: "pointer",
                                                fontWeight: "500"
                                          }}
                                    >
                                          Delete Account
                                    </button>
                              </div>
                        </div>
                  )}
            </>
      )



}

export default ChatInterface;
