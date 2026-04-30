const express = require("express")
const { sendMessage, getMessages } = require("../controllers/chatting/message")
const auth = require("../Auth/middleware")
const router = express.Router()

// Route to send a message to a specific user
router.post("/message/send/:receiverId", auth, sendMessage)

// Route to get all messages between you and a specific user
router.get("/message/:receiverId", auth, getMessages)

module.exports = router
