const express = require("express")
const deleteUser = require("../controllers/users/deleteuser")
const auth = require("../Auth/middleware")
const router = express.Router()

router.delete("/user/delete", auth, deleteUser)

module.exports = router
