import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './chatinterface.css';
import { io } from 'socket.io-client';

import { faMagnifyingGlass, faUser, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
function ChatInterface() {
      const navigate = useNavigate();
      const login_id = localStorage.getItem("userId");
      const username = localStorage.getItem("username");


      const [activeChat, setActiveChat] = useState(null);
      const [messages, setMessages] = useState([])
      const [searchQuery, setSearchQuery] = useState('')
      const [searchResults, setSearchResults] = useState([])
      const [newMessage, setNewMessage] = useState('')
      const [socket, setSocket] = useState(null);
      const [unreadCounts, setUnreadCounts] = useState({}); // the below state tracks unread messages per user


      // -----------------------------------------------------------
      // The below code fetches all previous conversations on page load
      // and pre-populates the contact panel
      // -----------------------------------------------------------
      useEffect(() => {

            const fetchConversations = async () => {
                  try {
                        // the below code fetches all users we have talked to before
                        const response = await axios.get(
                              "http://localhost:3000/api/message/conversations/all",
                              { withCredentials: true }
                        );

                        // the below code pre-populates the contact panel with our conversations
                        setSearchResults(response.data);

                  } catch (e) {
                        console.log("Error fetching conversations:", e);
                  }
            };

            fetchConversations();

      }, []); // empty array means this runs only ONCE when the page first loads

      const toggleLike = async (id, isCurrentlyFriend) => {
            // Optimistic UI update: instantly toggle the heart
            setSearchResults(prev => prev.map(user =>
                  user._id === id ? { ...user, isFriend: !isCurrentlyFriend } : user
            ));

            if (!isCurrentlyFriend) {
                  // Call backend to add them as a friend
                  try {
                        await axios.post(`http://localhost:3000/api/user/addfriend/${id}`, {}, { withCredentials: true });
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
                        await axios.post(`http://localhost:3000/api/user/removefriend/${id}`, {}, { withCredentials: true });
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
                  setSearchResults([]);
                  return;
            }

            try {
                  const response = await axios.get(`http://localhost:3000/api/user/search/${query}`, { withCredentials: true });
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
                        `http://localhost:3000/api/message/send/${receiverId}`,
                        { message: newMessage },
                        { withCredentials: true }
                  );


                  // 2. The below code is for preparing the socket.io data
                  const messageData = {
                        receiverId: activeChat._id,
                        senderId: login_id,
                        message: newMessage,
                  };


                  // 3. The below code is used to check if the socket is connected and send the message instantly
                  if (socket) {
                        socket.emit('send_message', messageData);
                  }


                  // 4. The below code adds the sent message to OUR OWN screen immediately
                  setMessages((prevMessages) => [
                        ...prevMessages,
                        { sender: login_id, message: newMessage }
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
                              `http://localhost:3000/api/message/${activeChat._id}`,
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
            const newSocket = io('http://localhost:3000');
            setSocket(newSocket);

            // 2. Tell the backend server our user ID to join our personal room
            if (login_id) {
                  newSocket.emit('setup', login_id);
            }

            // 3. The below code is used to listen for INCOMING messages from the socket
            newSocket.on("receive_message", (incomingMessage) => {

                  // the below code gets the ID of who sent the message
                  const whoSentIt = incomingMessage.senderId;

                  // the below code checks if we are currently viewing THAT person's chat
                  // we use a function form of setState to always get the latest activeChat
                  setMessages((prevMessages) => {

                        // check the current activeChat using the DOM (workaround for stale closure)
                        const currentChatId = document.getElementById("active-chat-id")?.dataset?.id;

                        if (currentChatId === whoSentIt) {
                              // the below code adds the message if we are already in this chat
                              return [...prevMessages, incomingMessage];
                        } else {
                              // the below code increments the unread badge count for that sender
                              setUnreadCounts((prev) => ({
                                    ...prev,
                                    [whoSentIt]: (prev[whoSentIt] || 0) + 1,
                              }));
                              return prevMessages;
                        }

                  });

            });


            // 4. The below code is to clean the connection when we leave the page
            return () => {
                  newSocket.disconnect();
            };

      }, [login_id]);

      const messageEndRef = useRef(null);
      return (
            <>
                  {/* the below hidden element stores the active chat ID so the socket listener can read it */}
                  <div id="active-chat-id" data-id={activeChat?._id || ""} style={{ display: "none" }} />
                  <div className="app-layout">
                        <div className="main-app">
                              <div id="left"></div>
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
                                                                  className="contact-row"
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

                                                            return (
                                                                  <div key={index} className={messageClass}>
                                                                        {msg.message}
                                                                  </div>
                                                            )
                                                      })
                                                }
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
            </>
      )



}

export default ChatInterface;
