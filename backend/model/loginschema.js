const mongoose = require("mongoose")

const LoginSchema = new mongoose.Schema({

      username: { type: String, required: true },

      email: { type: String, required: true },


      dob: { type: String, required: true },


      password: { type: String, required: true },

      phone: { type: String, required: true, unique: true },

      // list of people this user has added as friends

      friends: [
            {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Login"   // points to another user in the same Login collection
            }
      ]

}, { timestamps: true })  // auto adds createdAt and updatedAt

// export the model so other files can use it
module.exports = mongoose.model("Login", LoginSchema)
