const express = require("express")
const addFriend = require("../controllers/users/addFriend")
const auth = require("../Auth/middleware")
const router = express.Router()
router.post("/user/addfriend/:friendID", auth, addFriend)

module.exports = router
