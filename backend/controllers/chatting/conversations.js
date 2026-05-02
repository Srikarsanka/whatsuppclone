const Message = require("../../model/messageschema")
const User = require("../../model/loginschema")

// GET all users that the logged-in user has had a conversation with
const getConversations = async (req, res) => {
      try {
            const myId = req.user.id

            // the below code finds all messages where the logged-in user is either the sender or receiver
            const messages = await Message.find({
                  $or: [
                        { sender: myId },
                        { receiver: myId }
                  ]
            })

            // the below code collects all unique user IDs that we have talked with
            const contactedUserIds = new Set()

            messages.forEach((msg) => {
                  // if i am the sender, add the receiver id
                  if (msg.sender.toString() !== myId) {
                        contactedUserIds.add(msg.sender.toString())
                  }
                  // if i am the receiver, add the sender id
                  if (msg.receiver.toString() !== myId) {
                        contactedUserIds.add(msg.receiver.toString())
                  }
            })

            // the below code converts the Set to an Array so we can query the DB
            const userIds = Array.from(contactedUserIds)

            // if no conversations found, return empty array
            if (userIds.length === 0) {
                  return res.status(200).json([])
            }

            // the below code fetches the user details for each contacted user
            const me = await User.findById(myId)
            const users = await User.find({ _id: { $in: userIds } })

            // the below code builds the result array with displayName and isFriend
            const result = users.map((u) => {
                  const isFriend = me.friends.some(friendId => friendId.toString() === u._id.toString())
                  const displayName = isFriend ? u.username : u.phone

                  return {
                        _id: u._id,
                        displayName: displayName,
                        phone: u.phone,
                        isFriend: isFriend
                  }
            })

            return res.status(200).json(result)

      } catch (err) {
            return res.status(500).json({ message: "Internal Server Error" })
      }
}

module.exports = { getConversations }
