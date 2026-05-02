const user = require("../../model/loginschema")

const removeFriend = async (req, res) => {
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

            // Find the index of the friend
            const index = sender.friends.findIndex(id => id.toString() === receiver._id.toString())

            if (index > -1) {
                  // Slicing method using splice to remove exactly that index
                  sender.friends.splice(index, 1)
                  await sender.save()
                  return res.status(200).json({ message: "Friend removed successfully" })
            } else {
                  return res.status(400).json({ message: "User is not in your friends list" })
            }

      }
      catch (err) {
            return res.status(500).json({ message: "Internal server error while removing the friend" })
      }
}
module.exports = removeFriend
