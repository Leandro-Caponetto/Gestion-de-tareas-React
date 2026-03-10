import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId, userId, displayName, avatarUrl) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userId, displayName, socket.id, avatarUrl);
      
      socket.on("disconnect", () => {
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });

    // Chat messages
    socket.on("send-message", (data) => {
      io.to(data.roomId).emit("new-message", data);
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("typing", {
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping
      });
    });

    // WebRTC Signaling
    socket.on("offer", (data) => {
      io.to(data.target).emit("offer", {
        offer: data.offer,
        sender: socket.id,
        senderName: data.senderName
      });
    });

    socket.on("answer", (data) => {
      io.to(data.target).emit("answer", {
        answer: data.answer,
        sender: socket.id
      });
    });

    socket.on("ice-candidate", (data) => {
      io.to(data.target).emit("ice-candidate", {
        candidate: data.candidate,
        sender: socket.id
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
