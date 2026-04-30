// this file is for socket.io connection management
const { Server } = require("socket.io");
const initializeSocket = (server) => {
      const io = new Server(server,
            {
                  cors: {
                        origin: "http://localhost:5173",   // allow react frontend
                        methods: ["GET", "POST"]
                  }
            }
      )
      io.on("connection", (socket) => {
            console.log("A user connected", socket.id)
            socket.on("setup", (userId) => {
                  socket.join(userId)
                  console.log("User joined room", userId)
            })
            socket.on("send_message", (data) => {
                  socket.to(data.receiverId).emit("receive_message", data)
                  console.log("Message sent", data)

            })
            socket.on("disconnect", () => {
                  console.log("User disconnected", socket.id)
            })

      })
}
module.exports = initializeSocket