const express = require("express")
const removeFriend = require("../controllers/users/removeFriend")
const auth = require("../Auth/middleware")
const router = express.Router()

router.post("/user/removefriend/:friendID", auth, removeFriend)

module.exports = router
