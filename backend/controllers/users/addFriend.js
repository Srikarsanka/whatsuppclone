const user = require("../../model/loginschema")

const addFriend = async (req, res) => {
      try {

            const { friendID } = req.params
            // the sender id comes from the middleware auth.js req.user.id
            const loginUserID = req.user.id
            if (!friendID || !loginUserID) {
                  return res.status(400).json({ message: "Bad request" })
            }
            const sender = await user.findById(loginUserID)
            const receiver = await user.findById(friendID)

            if (!sender || !receiver) {
                  return res.status(404).json({ message: "User not found" })
            }
            if (receiver._id.toString() === loginUserID) {
                  return res.status(400).json({ message: "You cannot add yourself" })
            }

            if (sender.friends.includes(receiver._id.toString())) {
                  return res.status(400).json({ message: "User already added as a friend" })
            }
            sender.friends.push(receiver._id)
            await sender.save()
            return res.status(200).json({ message: "Friend added successfully" })


      }
      catch (err) {
            return res.status(500).json({ message: "Internal server error while adding the friend" })
      }
}
module.exports = addFriend