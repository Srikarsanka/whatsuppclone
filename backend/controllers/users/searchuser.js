const User = require("../../model/loginschema")

const searchUser = async (req, res) => {
      try {
            const loginUserID = req.user.id
            const searchTerm = req.params.searchTerm

            // search the DB by username OR email OR phone — returns all matching users
            const foundUsers = await User.find({
                  $or: [
                        { username: searchTerm },
                        { email: searchTerm },
                        { phone: searchTerm }
                  ]
            })

            // no user found
            if (!foundUsers || foundUsers.length === 0) {
                  return res.status(404).json({ message: "No user found" })
            }

            // get your data to check friends list
            const me = await User.findById(loginUserID)

            // build result list — skip yourself
            const result = []

            for (let i = 0; i < foundUsers.length; i++) {
                  const u = foundUsers[i]

                  // skip yourself from results
                  if (u._id.toString() === loginUserID) {
                        continue
                  }

                  // check if this user is your friend
                  const isFriend = me.friends.includes(u._id.toString())

                  // if friend show username, if not friend show phone number
                  let displayName
                  if (isFriend) {
                        displayName = u.username
                  } else {
                        displayName = u.phone
                  }

                  result.push({
                        _id: u._id,
                        displayName: displayName,
                        phone: u.phone
                  })
            }

            if (result.length === 0) {
                  return res.status(404).json({ message: "No user found" })
            }

            return res.status(200).json(result)

      } catch (err) {
            return res.status(500).json({ message: "Internal server error while searching" })
      }
}

module.exports = searchUser
