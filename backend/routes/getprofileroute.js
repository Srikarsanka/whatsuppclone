const express = require("express")
const getprofile = require("../controllers/users/getprofile")
const auth = require("../Auth/middleware")
const router = express.Router()

router.get("/user/profile", auth, getprofile)

module.exports = router
