const Register = require("../../model/loginschema")
const bcrypt = require("bcryptjs")

const register = async (req, res) => {
      try {

            const { username, password, repassword, dob, email, phone } = req.body
            if (!username || !password || !repassword || !dob || !email || !phone) {
                  return res.status(400).json({ message: "required all missing feilds" })
            }
            const user = await Register.findOne({ username })
            const email1 = await Register.findOne({ email })
            const phone1 = await Register.findOne({ phone })
            if (user || email1 || phone1) {
                  return res.status(400).json({ message: "username, email or phone already exists" })
            }
            if (password !== repassword) {
                  return res.status(400).json({ message: "password and repassword are not matching" })
            }
            const pass = await bcrypt.hash(password, 10)
            const data = new Register({
                  username,
                  email,
                  dob,
                  phone,
                  password: pass
            })
            await data.save()
            return res.status(200).json({ message: "Registered successfully" })


      }
      catch (err) {
            return res.status(500).json({ message: "Internal Server error while registeration", err })
      }
}


module.exports = register
