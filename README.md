# 💬 WhatsApp Web Clone

A full-stack real-time chat application built to mimic the WhatsApp Web interface. Users can register, log in, search for other users, add/remove friends, and send real-time messages using Socket.IO.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                         │
│              React (Vite) — localhost:5173              │
│                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│   │  Login /    │    │   Chat      │    │  Search / │  │
│   │  Register   │    │  Interface  │    │  Friends  │  │
│   └─────────────┘    └─────────────┘    └───────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP (Axios) + WebSocket (Socket.IO)
┌──────────────────────────▼──────────────────────────────┐
│                        BACKEND                          │
│              Node.js + Express — localhost:3000         │
│                                                         │
│   ┌──────────────┐  ┌───────────────┐  ┌────────────┐  │
│   │  REST API    │  │  Socket.IO    │  │  Auth      │  │
│   │  Routes      │  │  Server       │  │  Middleware│  │
│   └──────────────┘  └───────────────┘  └────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │  Mongoose ODM
┌──────────────────────────▼──────────────────────────────┐
│                       DATABASE                          │
│                   MongoDB Atlas (Cloud)                 │
│                                                         │
│   ┌─────────────────┐      ┌──────────────────────┐    │
│   │  Users          │      │  Messages            │    │
│   │  (Login Schema) │      │  (Message Schema)    │    │
│   └─────────────────┘      └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login with cookie-based tokens
- 🔍 **User Search** — Search users by username, email, or phone
- ❤️ **Add / Remove Friends** — Toggle friend status with instant UI updates
- 💬 **Real-Time Messaging** — Powered by Socket.IO
- 📜 **Message History** — All chats are stored in MongoDB and loaded on demand
- 🔔 **Unread Message Badge** — Green badge shows unread count per contact
- 📋 **Conversations Panel** — Auto-loads all previous conversations on startup
- 🌙 **WhatsApp Dark Theme** — Pixel-perfect dark UI

---

## 📁 Folder Structure

```
whatsapp-clone/
├── backend/
│   ├── Auth/
│   │   └── middleware.js          # JWT verification middleware
│   ├── controllers/
│   │   ├── chatting/
│   │   │   ├── message.js         # sendMessage, getMessages
│   │   │   └── conversations.js   # getConversations
│   │   ├── socket.io/
│   │   │   └── socket.js          # Socket.IO server logic
│   │   └── users/
│   │       ├── register.js        # Register new user
│   │       ├── login.js           # Login + issue JWT cookie
│   │       ├── searchuser.js      # Search users
│   │       ├── addFriend.js       # Add a friend
│   │       └── removeFriend.js    # Remove a friend
│   ├── model/
│   │   ├── loginschema.js         # User mongoose model
│   │   └── messageschema.js       # Message mongoose model
│   ├── routes/
│   │   ├── userroute.js           # User-related routes
│   │   └── messageroute.js        # Message-related routes
│   ├── .env                       # Environment variables (do not commit)
│   └── server.js                  # Main Express server entry point
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── ChatInterface.jsx  # Main chat page
│       │   ├── login.css
│       │   ├── register.css
│       │   └── chatinterface.css
│       ├── App.jsx
│       └── main.jsx
│
├── docs/                          # Local documentation (not pushed to GitHub)
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` folder with the following:

```env
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

| Variable | Description |
|---|---|
| `PORT` | The port number the backend server runs on |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A secret string used to sign and verify JWT tokens |

---

## 📦 Packages Used

### Backend

| Package | Why We Use It |
|---|---|
| `express` | Web framework for building the REST API |
| `mongoose` | Connects to MongoDB and defines data models |
| `socket.io` | Enables real-time two-way communication |
| `jsonwebtoken` | Creates and verifies JWT tokens for authentication |
| `bcrypt` | Hashes passwords securely before saving to DB |
| `cookie-parser` | Reads JWT cookies from incoming requests |
| `cors` | Allows the React frontend to talk to the backend |
| `dotenv` | Loads `.env` variables into `process.env` |

### Frontend

| Package | Why We Use It |
|---|---|
| `react` | UI framework |
| `react-router-dom` | Handles navigation between pages (Login, Register, Chat) |
| `axios` | Makes HTTP requests to the backend API |
| `socket.io-client` | Connects the React frontend to the Socket.IO backend |
| `@fortawesome/react-fontawesome` | Icons (search, user, send button) |

---

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Srikarsanka/whatsuppclone.git
cd whatsuppclone
```

### 2. Set up the Backend
```bash
cd backend
npm install
# Create your .env file with MONGO_URI, JWT_SECRET, PORT
node server.js
```

### 3. Set up the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser
```
http://localhost:5173
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/user/register` | Register a new user |
| POST | `/api/user/login` | Login and receive JWT cookie |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/user/search/:searchTerm` | Search users by name, email, or phone |
| POST | `/api/user/addfriend/:friendID` | Add a user as a friend |
| POST | `/api/user/removefriend/:friendID` | Remove a user from friends |

### Messages
| Method | Route | Description |
|---|---|---|
| POST | `/api/message/send/:receiverId` | Send a message to a user |
| GET | `/api/message/conversations/all` | Get all users you have chatted with |
| GET | `/api/message/:receiverId` | Get all messages between you and a user |

---

## 🚢 Deployment

- **Frontend** → Deploy on [Vercel](https://vercel.com)
- **Backend** → Deploy on [Render](https://render.com)
- **Database** → [MongoDB Atlas](https://cloud.mongodb.com) (already cloud-hosted)

> ⚠️ Remember to update the API base URL in the frontend from `http://localhost:3000` to your Render backend URL before deploying.

---

## 👨‍💻 Built By

Srikar Sanka — [@Srikarsanka](https://github.com/Srikarsanka)
