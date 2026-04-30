const mongoose = require("mongoose")

const MessageSchema = new mongoose.Schema({
      sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Login",
            required: true
      },
      receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Login",
            required: true
      },
      message: {
            type: String,
            required: true
      }
}, { timestamps: true })

module.exports = mongoose.model("Message", MessageSchema)
