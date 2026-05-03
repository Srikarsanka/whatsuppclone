const User = require("../../model/loginschema")
const Message = require("../../model/messageschema")

const deleteUser = async (req, res) => {
      try {
            const userId = req.user.id

            // 1. Delete all messages where this user is the sender or receiver
            await Message.deleteMany({
                  $or: [
                        { sender: userId },
                        { receiver: userId }
                  ]
            })

            // 2. Remove this user from everyone else's friends list
            await User.updateMany(
                  { friends: userId },
                  { $pull: { friends: userId } }
            )

            // 3. Delete the user document itself
            await User.findByIdAndDelete(userId)

            // 4. Clear the auth cookie
            res.clearCookie("token")

            return res.status(200).json({ message: "Account deleted successfully" })

      } catch (err) {
            console.log("Error deleting user:", err)
            return res.status(500).json({ message: "Internal Server error while deleting user" })
      }
}

module.exports = deleteUser
