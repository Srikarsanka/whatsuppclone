const Message = require("../../model/messageschema")
const crypto = require("crypto")

// Encryption config — uses AES-256-CBC algorithm
const ENCRYPTION_KEY = process.env.scretkey ? process.env.scretkey.padEnd(32, '0').slice(0, 32) : "default_key_change_me_12345678901" // 32 bytes for AES-256
const IV_LENGTH = 16 // AES block size

// Encrypt a plain text message
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    // Store IV + encrypted text together (IV is needed for decryption)
    return iv.toString("hex") + ":" + encrypted.toString("hex")
}

// Decrypt an encrypted message back to plain text
const decrypt = (text) => {
    const parts = text.split(":")
    const iv = Buffer.from(parts[0], "hex")
    const encryptedText = Buffer.from(parts[1], "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

// SEND a message
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body
        const sender = req.user.id          // Your ID (from JWT)
        const receiver = req.params.receiverId // Friend's ID (from URL)

        if (!message) {
            return res.status(400).json({ message: "Message cannot be empty" })
        }

        // Encrypt the message before saving to MongoDB
        const encryptedMessage = encrypt(message)

        const newMessage = new Message({ sender, receiver, message: encryptedMessage })
        await newMessage.save()

        // Return the original (decrypted) message to the sender so the UI displays it correctly
        const responseData = { ...newMessage.toObject(), message: message }

        return res.status(201).json({ message: "Message sent", data: responseData })

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

        // Decrypt each message before sending to the frontend
        const decryptedMessages = messages.map((msg) => {
            const msgObj = msg.toObject()
            try {
                msgObj.message = decrypt(msgObj.message)
            } catch (e) {
                // If decryption fails (old unencrypted message), keep original
                msgObj.message = msgObj.message
            }
            return msgObj
        })

        return res.status(200).json(decryptedMessages)

    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = { sendMessage, getMessages }
