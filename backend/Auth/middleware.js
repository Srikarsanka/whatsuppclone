
const scretkey = process.env.scretkey
const jwt = require("jsonwebtoken")
const auth = async (req, res, next) => {
      try {
            const token = req.cookies.token
            if (!token) {
                  return res.status(401).json({ message: "Unauthorised" })

            }
            const decoded = jwt.verify(token, scretkey)
            // if (!decoded) {
            //       return res.status(401).json({ message: "Invalid token" })
            // }
            req.user = decoded
            next()
      }
      catch (err) {
            console.log("Internal server error while verifying the token", err)
            return res.status(500).json({ message: "Internal Server error while verifying the token" })
      }



}

module.exports = auth
