const User = require("../../model/loginschema")

const getprofile = async (req, res) => {
      try {
            const id = req.user.id
            if (!id) {
                  return res.status(400).json({ message: "No current user please login in" })
            }
            const user = await User.findById(id)
            if (!user) {
                  return res.status(404).json({ message: "No User found" })
            }
            const data = {
                  username: user.username,
                  email: user.email,
                  phone: user.phone,
                  dob: user.dob,
            }
            return res.status(200).json({ data })

      }
      catch (err) {
            console.log("Error in getprofile:", err)
            return res.status(500).json({ message: "Internal Server error while getting the profile" })
      }
}

module.exports = getprofile