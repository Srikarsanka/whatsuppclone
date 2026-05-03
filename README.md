# Whatsupp Clone

A full-stack real-time chat application built to mimic the WhatsApp Web interface. Users can register, log in, search for other users, add/remove friends, and send real-time messages using Socket.IO.

### Live Demo
- **Frontend:** [https://whatsupp-liart.vercel.app/login](https://whatsupp-liart.vercel.app/login)
- **Backend:** ``

---

## Screenshots

- **Login Page:**
  ![Login Page](https://res.cloudinary.com/djha4r2ys/image/upload/v1777795598/98895958-f85d-4fe4-8da5-ffba459584b1.png)

- **Register Page:**
  ![Register Page](https://res.cloudinary.com/djha4r2ys/image/upload/v1777795648/62e116f9-0192-4f9b-8532-8894a56ee968.png)

- **Main Chat Interface:**
  ![Main Chat Interface](https://res.cloudinary.com/djha4r2ys/image/upload/v1777795703/046dd514-b6fd-4c48-bf9a-2a0db189f27c.png)

- **Profile & Delete User:**
  ![Profile](https://res.cloudinary.com/djha4r2ys/image/upload/v1777795738/a6496f0f-0caf-4fea-ab9d-82e67680c94d.png)

---

## How It Works

This application is built with a decoupled frontend and backend.
1. **Frontend (React)**: Manages UI state, handles user interactions, and renders real-time updates instantly using optimistic UI patterns (so the app feels fast, just like real WhatsApp).
2. **Backend (Node.js/Express)**: Provides REST APIs for authentication, user search, and storing messages securely.
3. **Database (MongoDB)**: Stores user data and chat history. All messages are **encrypted with AES-256-CBC** before being saved to the database.
4. **Real-Time Delivery (Socket.IO)**: Once a message is sent via the API, it is immediately pushed through a WebSocket connection to the receiver's private "Room" (using their MongoDB ID as the room name). If the receiver has the chat open, it appears instantly. If not, a green unread badge increments.



---

## System Architecture

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

## App Workflow

1. **Authentication**: Users must register and log in. A JWT (JSON Web Token) is securely issued in an HTTP-only cookie. Every backend route verifies this cookie using an `auth` middleware.
2. **Initialization**: When the `ChatInterface` loads, it automatically asks the backend: *"Who have I talked to recently?"* The backend checks the `Messages` collection, finds all unique user IDs, and populates the left contact panel.
3. **Friend System**: Users can search for people by name, email, or phone. If they click the heart icon, it adds that user's MongoDB `_id` to their personal `friends` array. Friends display their `username`, while non-friends only display their `phone number`.
4. **Real-time Messaging**: 
   - Every time a user connects, Socket.IO places them in a private "Room" named after their MongoDB `_id`.
   - When User A sends a message to User B, it is saved to MongoDB via a standard `POST` request.
   - Immediately after, User A's browser `emits` the message via Socket.IO directly to User B's private Room.
   - User B's browser receives the event and instantly renders the message if the chat is open, OR increments a green unread badge if the chat is closed.

---

## Features

- **JWT Authentication** — Secure login with cookie-based tokens
- **User Search** — Search users by username, email, or phone
- **Add / Remove Friends** — Toggle friend status with instant UI updates
- **Real-Time Messaging** — Powered by Socket.IO
- **Message History** — All chats are stored in MongoDB and loaded on demand
- **Unread Message Badge** — Green badge shows unread count per contact
- **Conversations Panel** — Auto-loads all previous conversations on startup
- **WhatsApp Dark Theme** — Pixel-perfect dark UI with correct message tails and timestamps
- **Delete Account** — Users can permanently delete their account and all associated data

---

## Folder Structure

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
│   │       ├── removeFriend.js    # Remove a friend
│   │       ├── getprofile.js      # Get user profile
│   │       └── deleteuser.js      # Delete user account
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
├── .gitignore
└── README.md
```

---

## Environment Variables

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

## Packages Used

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

## How to Run Locally

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

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/user/register` | Register a new user |
| POST | `/api/user/login` | Login and receive JWT cookie |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/user/search/:searchTerm` | Search users by name, email, or phone |
| GET | `/api/user/profile` | Get logged-in user's profile |
| POST | `/api/user/addfriend/:friendID` | Add a user as a friend |
| POST | `/api/user/removefriend/:friendID` | Remove a user from friends |
| DELETE | `/api/user/delete` | Delete user account and all messages |

### Messages
| Method | Route | Description |
|---|---|---|
| POST | `/api/message/send/:receiverId` | Send a message to a user |
| GET | `/api/message/conversations/all` | Get all users you have chatted with |
| GET | `/api/message/:receiverId` | Get all messages between you and a user |

---

## Deployment

- **Frontend** — Deploy on [Vercel](https://vercel.com)
- **Backend** — Deploy on [Render](https://render.com)
- **Database** — [MongoDB Atlas](https://cloud.mongodb.com) (already cloud-hosted)

> Remember to update the API base URL in the frontend from `http://localhost:3000` to your Render backend URL before deploying.

---

## Built By

Srikar Sanka — [@Srikarsanka](https://github.com/Srikarsanka)
