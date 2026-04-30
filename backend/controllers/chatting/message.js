const Message = require("../../model/messageschema")

// SEND a message
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body
        const sender = req.user.id          // Your ID (from JWT)
        const receiver = req.params.receiverId // Friend's ID (from URL)

        if (!message) {
            return res.status(400).json({ message: "Message cannot be empty" })
        }

        const newMessage = new Message({ sender, receiver, message })
        await newMessage.save()

        return res.status(201).json({ message: "Message sent", data: newMessage })

    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// GET messages
const getMessages = async (req, res) => {
    try {
        const sender = req.user.id           // Your ID (from JWT)
        const receiver = req.params.receiverId // Friend's ID (from URL)

        // Find messages where:
        // (You sent to Them) OR (They sent to You)
        const messages = await Message.find({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ createdAt: 1 }) // 1 means oldest first

        return res.status(200).json(messages)

    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = { sendMessage, getMessages }
