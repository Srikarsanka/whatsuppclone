const express = require("express")
const { sendMessage, getMessages } = require("../controllers/chatting/message")
const { getConversations } = require("../controllers/chatting/conversations")
const auth = require("../Auth/middleware")
const router = express.Router()

// Route to send a message to a specific user
router.post("/message/send/:receiverId", auth, sendMessage)

// Route to get all users you have had a conversation with (for the contact panel)
// IMPORTANT: this must be ABOVE /message/:receiverId otherwise Express will treat "conversations" as a receiverId
router.get("/message/conversations/all", auth, getConversations)

// Route to get all messages between you and a specific user
router.get("/message/:receiverId", auth, getMessages)

module.exports = router
