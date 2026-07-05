import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = http.createServer(app);
  
  // Socket.IO for WebRTC Signaling
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const receivers = new Map();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Receiver registers itself
    socket.on("register-receiver", (data) => {
      receivers.set(socket.id, {
        id: socket.id,
        name: data.name,
        ip: data.ip
      });
      console.log("Receiver registered:", data.name);
      io.emit("receivers-list", Array.from(receivers.values()));
    });

    socket.on("get-receivers", () => {
      socket.emit("receivers-list", Array.from(receivers.values()));
    });

    // Join a room (Receiver creates a room, Sender joins it)
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    // WebRTC Signaling messages
    socket.on("offer", (data) => {
      socket.to(data.roomId).emit("offer", { offer: data.offer, sender: socket.id });
    });

    socket.on("answer", (data) => {
      socket.to(data.roomId).emit("answer", { answer: data.answer, sender: socket.id });
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.roomId).emit("ice-candidate", { candidate: data.candidate, sender: socket.id });
    });
    
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      if (receivers.has(socket.id)) {
        receivers.delete(socket.id);
        io.emit("receivers-list", Array.from(receivers.values()));
      }
    });
  });

  // API route for health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
