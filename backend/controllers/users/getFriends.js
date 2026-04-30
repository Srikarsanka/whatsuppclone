const User = require("../../model/loginschema")

const getFriends = async (req, res) => {
      try {
            const loginUserID = req.user.id

            // find the logged in user to get their friends array
            const me = await User.findById(loginUserID)

            if (!me) {
                  return res.status(404).json({ message: "User not found" })
            }

            // create an empty array to hold the actual friend details
            const friendsData = []

            // simple loop to get each friend's details one by one
            for (let i = 0; i < me.friends.length; i++) {
                  const friendId = me.friends[i]
                  
                  // find the friend in the database by their ID
                  const friendDetails = await User.findById(friendId)
                  
                  if (friendDetails) {
                        // push only the necessary details to our array
                        friendsData.push({
                              _id: friendDetails._id,
                              username: friendDetails.username,
                              phone: friendDetails.phone
                        })
                  }
            }

            // send the array back to the frontend
            return res.status(200).json(friendsData)

      } catch (err) {
            return res.status(500).json({ message: "Internal server error while fetching friends" })
      }
}

module.exports = getFriends
