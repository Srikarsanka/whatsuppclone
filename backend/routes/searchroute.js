const express = require("express")
const searchUser = require("../controllers/users/searchuser")
const auth = require("../Auth/middleware")  // Import auth middleware
const router = express.Router()

// GET request — must pass JWT token (auth middleware)
// :searchTerm is what the user types in the search bar
router.get("/user/search/:searchTerm", auth, searchUser)

module.exports = router
