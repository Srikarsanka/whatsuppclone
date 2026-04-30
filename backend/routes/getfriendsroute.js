const express = require("express")
const getFriends = require("../controllers/users/getFriends")
const auth = require("../Auth/middleware")  // Import auth middleware
const router = express.Router()

// GET request — fetch all friends of the logged-in user
router.get("/user/friends", auth, getFriends)

module.exports = router
