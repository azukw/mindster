const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {}; // { roomCode: { hostId, mode, hostCode, players: { socketId: { name, progress } } } }

const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const calculateFeedback = (attempt, secret) => {
    const feedback = { correct: 0, misplaced: 0 };
    const secretCopy = [...secret];
    const attemptCopy = [...attempt];
    attemptCopy.forEach((c, i) => {
        if (c === secretCopy[i]) { feedback.correct++; secretCopy[i]=null; attemptCopy[i]=null; }
    });
    attemptCopy.forEach((c) => {
        if (c !== null) {
            const idx = secretCopy.indexOf(c);
            if (idx !== -1) { feedback.misplaced++; secretCopy[idx]=null; }
        }
    });
    return feedback;
};

io.on("connection", (socket) => {
    socket.on("create-room", ({ name, mode }, cb) => {
        const roomCode = genCode();
        rooms[roomCode] = { hostId: socket.id, mode, hostCode: null, players: {} };
        socket.join(roomCode);
        rooms[roomCode].players[socket.id] = { name: name || "Host", progress: [] };
        cb({ roomCode });
        io.to(roomCode).emit("room-update", rooms[roomCode]);
    });

    socket.on("join-room", ({ roomCode, name }, cb) => {
        const room = rooms[roomCode];
        if (!room) return cb({ error: "NOT_FOUND" });
        socket.join(roomCode);
        room.players[socket.id] = { name: name || "Guest", progress: [] };
        cb({ ok: true, mode: room.mode });
        io.to(roomCode).emit("room-update", room);
    });

    socket.on("set-secret", ({ roomCode, secretCode }, cb) => {
        const room = rooms[roomCode];
        if (!room) return cb({ error: "NOT_FOUND" });
        if (socket.id !== room.hostId) return cb({ error: "NOT_HOST" });
        room.hostCode = secretCode;
        io.to(roomCode).emit("host-set-secret");
        cb({ ok: true });
    });

    socket.on("submit-guess", ({ roomCode, guess }, cb) => {
        const room = rooms[roomCode];
        if (!room || !room.hostCode) return cb({ error: "NO_GAME" });
        const feedback = calculateFeedback(guess, room.hostCode);
        // update player's progress
        if (room.players[socket.id]) {
            room.players[socket.id].progress.push({ guess, feedback });
        }
        // send feedback to guesser
        socket.emit("guess-feedback", { feedback });
        // notify opponent(s) with progress summary
        socket.to(roomCode).emit("opponent-progress", {
            id: socket.id,
            name: room.players[socket.id].name,
            progress: room.players[socket.id].progress.length,
            lastFeedback: feedback,
        });
        const codeLength = room.hostCode.length;
        const won = feedback.correct === codeLength;
        if (won) {
            io.to(roomCode).emit("game-over", { winnerId: socket.id, name: room.players[socket.id].name });
        }
        cb({ ok: true, feedback });
    });

    socket.on("request-rematch", ({ roomCode }, cb) => {
        const room = rooms[roomCode];
        if (!room) return cb({ error: "NOT_FOUND" });
        // reset players progress and hostCode (host must set new one)
        Object.values(room.players).forEach((p) => p.progress = []);
        room.hostCode = null;
        io.to(roomCode).emit("rematch-start");
        cb({ ok: true });
    });

    socket.on("leave-room", ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;
        socket.leave(roomCode);
        if (room.players[socket.id]) delete room.players[socket.id];
        if (socket.id === room.hostId) {
            // close room
            io.to(roomCode).emit("room-closed");
            delete rooms[roomCode];
        } else {
            io.to(roomCode).emit("room-update", room);
        }
    });

    socket.on("disconnect", () => {
        // remove from any rooms
        for (const code of Object.keys(rooms)) {
            const room = rooms[code];
            if (room.players[socket.id]) {
                delete room.players[socket.id];
                io.to(code).emit("room-update", room);
            }
            if (room.hostId === socket.id) {
                io.to(code).emit("room-closed");
                delete rooms[code];
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Socket server listening on", PORT));