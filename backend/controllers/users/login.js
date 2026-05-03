const jwt = require("jsonwebtoken")
const scretkey = process.env.scretkey
const Login = require("../../model/loginschema")
const bcrypt = require("bcryptjs")

const loggedin = async (req, res) => {
      try {
            const { phone, password } = req.body
            if (!phone || !password) {
                  return res.status(400).json({ message: "Phone number and password are required" })
            }
            const user = await Login.findOne({ phone })
            if (!user) {
                  return res.status(400).json({ message: "Phone number not found! please register first" })
            }
            const validPass = await bcrypt.compare(password, user.password)
            if (!validPass) {
                  return res.status(400).json({ message: "Invalid Password" })
            }

            const token = jwt.sign({ name: user.username, id: user._id }, scretkey, { expiresIn: "7d" })
            res.cookie("token", token, {
                  httpOnly: true,
                  secure: false,
                  sameSite: "lax",
                  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
            });
            return res.status(200).json({ message: "login successfully", userId: user._id, username: user.username })

      }
      catch (err) {
            return res.status(500).json({ message: "Internal Server error , if problem persisits then try again later" })
      }
}
module.exports = loggedin