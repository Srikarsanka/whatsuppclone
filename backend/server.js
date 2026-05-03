const express = require("express")
const app = express()
const dotenv = require("dotenv")
const mongose = require("mongoose")
const cookieparser = require("cookie-parser")
const cors = require("cors")

// the below code is for the socket.io
const initializeSocket = require("./controllers/socket.io/socket");
const http = require("http");
const server = http.createServer(app)
// midleware to get the data from the dotenv file
dotenv.config()
const port = process.env.PORT
const mongo_url = process.env.mongo_url

// middlewares to parse the data
app.use(express.json())
app.use(cookieparser())
app.use(cors({
      origin: "http://localhost:5173",
      credentials: true
}))

// routes
const loginroute = require("./routes/loginroute")
const registerroute = require("./routes/registerroute")
const searchroute = require("./routes/searchroute")
const addfriendroute = require("./routes/addfriendroute")
const removefriendroute = require("./routes/removefriendroute")
const getfriendsroute = require("./routes/getfriendsroute")
const messageroute = require("./routes/messageroute")
const getprofileroute = require("./routes/getprofileroute")
const deleteuserroute = require("./routes/deleteuserroute")

app.use("/api", loginroute)
app.use("/api", registerroute)
app.use("/api", searchroute)
app.use("/api", addfriendroute)
app.use("/api", removefriendroute)
app.use("/api", getfriendsroute)
app.use("/api", messageroute)
app.use("/api", getprofileroute)
app.use("/api", deleteuserroute)


const startServer = async () => {
      try {
            const mongo = await mongose.connect(mongo_url)
            if (mongo) {
                  console.log("mongodb connected successfully..")
                  server.listen(port, () => {
                        console.log(`server running successfully on http://localhost:${port}`)
                  })
                  initializeSocket(server);
            }


      }
      catch (err) {
            console.log("Internal Server Error ,", err);
      }
}

startServer()