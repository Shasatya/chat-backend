# Real-Time Chat Application - Backend

A Node.js backend for real-time chat with Socket.io, Redis, and PostgreSQL. Supports private messaging, group chats, media sharing, and live status updates.

![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socket.io)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)

---

## Features

- **JWT Authentication** - Secure registration and login
- **Real-Time Messaging** - Instant delivery with Socket.io
- **Private & Group Chats** - 1-on-1 and group conversations
- **Friend System** - Search users, send/accept friend requests
- **Media Sharing** - Profile pictures and image messages via Cloudinary
- **Live Status** - Online/offline indicators and typing notifications
- **Chat History** - Persistent message storage with PostgreSQL

---

## Tech Stack

**Runtime:** Node.js  
**Framework:** Express.js 5.2  
**Database:** PostgreSQL  
**ORM:** Prisma 5.22  
**Real-time:** Socket.io 4.8  
**State Adapter:** Redis (Pub/Sub)  
**File Storage:** Cloudinary  
**Auth:** JWT  
**Utilities:** Multer, bcryptjs, Helmet, Zod

---

## Getting Started

### Prerequisites

- Node.js 16 or higher
- PostgreSQL (local or cloud)
- Redis (local or cloud)
- Cloudinary account for media storage

### Installation

1. Clone and navigate to backend

   ```bash
   cd
   chat-backend
   npm install
   ```

2. Set up environment variables - create `.env`:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/chatdb
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   REDIS_URL=redis://localhost:6379
   PORT=4000
   ```

3. Set up the database

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Run the dev server
   ```bash
   npm run dev
   ```

Server runs on [http://localhost:4000](http://localhost:4000)

---

## Environment Variables

| Variable                | Description                  | Required |
| ----------------------- | ---------------------------- | -------- |
| `DATABASE_URL`          | PostgreSQL connection string | Yes      |
| `JWT_SECRET`            | Secret for JWT signing       | Yes      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name        | Yes      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key           | Yes      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret        | Yes      |
| `REDIS_URL`             | Redis connection string      | Yes      |
| `PORT`                  | Server port (default: 4000)  | No       |

---

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

### Friends

- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `DELETE /api/friends/:id` - Remove friend

### Chats

- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message

### Users

- `GET /api/users/search` - Search users
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload profile picture

---

## Socket Events

### Client → Server

- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server → Client

- `new_message` - New message received
- `user_online` - User came online
- `user_offline` - User went offline
- `typing_indicator` - Someone is typing
- `message_delivered` - Message delivery confirmation

---

## Project Structure

```

chat-backend/
├── node_modules/
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── lib/             # Utilities and helpers
│   ├── routes/          # API routes
│   ├── sockets/         # Socket.io handlers
│   └── index.js         # Entry point
├── .env                 # Environment variables
├── .gitignore
├── docker-compose.yml   # Docker setup
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

---

## Scripts

```bash
npm run dev       # Start development server
npm start         # Start production server
npx prisma studio # Open Prisma Studio
npx prisma migrate dev # Run migrations
```

---

## Roadmap

- [ ] Message reactions (emoji)
- [ ] Voice messages
- [ ] Video calls
- [ ] Read receipts
- [ ] Message search
- [ ] File attachments (PDF, docs)
- [ ] Rate limiting
- [ ] End-to-end encryption

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

1. Fork the repo
2. Create your branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## License

Unlicense License

---

## Author

**Satyam Sharma**

[![GitHub](https://img.shields.io/badge/GitHub-Shasatya-100000?style=flat-square&logo=github)](https://github.com/Shasatya)

---

**Star this repo if you found it helpful!**
