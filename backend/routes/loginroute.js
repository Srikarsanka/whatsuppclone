const express = require("express")
const Login = require("../controllers/users/login")
const router = express.Router()
router.post("/user/login", Login)
module.exports = router