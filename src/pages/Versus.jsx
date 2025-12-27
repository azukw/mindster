import { useEffect, useState } from "react";
import socket, { connectSocket, disconnectSocket } from "../socket";
import useGame from "../context/GameContext";
import Board from "../components/Board";

export default function VersusPage() {
    const { state } = useGame();
    const [connected, setConnected] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [mode, setMode] = useState("normal");
    const [role, setRole] = useState(null); // "host" | "guest"
    const [lobby, setLobby] = useState(null);
    const [name, setName] = useState("Player");
    const [secretInput, setSecretInput] = useState([]); // array of colors e.g. ["red","blue"...]
    const [opponentProgress, setOpponentProgress] = useState(null);

    useEffect(() => {
        connectSocket();
        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socket.on("room-update", (room) => setLobby(room));
        socket.on("host-set-secret", () => { /* start guessing phase for guests */ });
        socket.on("opponent-progress", (data) => setOpponentProgress(data));
        socket.on("guess-feedback", (data) => {
            // afficher feedback pour notre guess
            console.log("feedback", data);
        });
        socket.on("game-over", (data) => {
            alert(`${data.name} a gagné !`);
        });
        socket.on("rematch-start", () => {
            setSecretInput([]);
            setOpponentProgress(null);
            // inviter le host à resaisir secret
        });
        socket.on("room-closed", () => {
            alert("Salon fermé");
            // cleanup
            setLobby(null);
            setRole(null);
        });

        return () => {
            disconnectSocket();
            socket.off();
        };
    }, []);

    const createRoom = () => {
        socket.emit("create-room", { name, mode }, ({ roomCode }) => {
            setRoomCode(roomCode);
            setRole("host");
        });
    };

    const joinRoom = () => {
        if (!roomCode) return alert("Code requis");
        socket.emit("join-room", { roomCode, name }, (res) => {
            if (res?.error) return alert(res.error);
            setRole("guest");
            setMode(res.mode || "normal");
        });
    };

    const setSecret = () => {
        if (!secretInput || secretInput.length === 0) return alert("Choisir un code");
        socket.emit("set-secret", { roomCode, secretCode: secretInput }, (res) => {
            if (res?.error) return alert(res.error);
            // host ready
        });
    };

    const submitGuess = (guess) => {
        socket.emit("submit-guess", { roomCode, guess }, (res) => {
            if (res?.error) return alert(res.error);
            // res.feedback is available
        });
    };

    const requestRematch = () => socket.emit("request-rematch", { roomCode });

    // UI minimal : lobby + own Board + opponent progress line
    return (
        <div style={{ padding: 16 }}>
            <h2>Versus</h2>
            {!role && (
                <div style={{ display: "flex", gap: 8 }}>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom" />
                    <select value={mode} onChange={e => setMode(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                        <option value="extreme">Extreme</option>
                    </select>
                    <button onClick={createRoom} disabled={!connected}>Host</button>
                    <input placeholder="Code salon" value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase())}/>
                    <button onClick={joinRoom} disabled={!connected}>Rejoindre</button>
                </div>
            )}

            {role === "host" && (
                <div>
                    <p>Salon: <strong>{roomCode}</strong> — Mode: {mode}</p>
                    <p>Choisir votre code secret (utiliser les couleurs du thème):</p>
                    {/* Intégrer une UI pour choisir secretInput ; ici simplifié */}
                    <input placeholder="ex: red,blue,green" value={secretInput.join(",")} onChange={e => setSecretInput(e.target.value.split(",").map(s=>s.trim()))}/>
                    <button onClick={setSecret}>Valider le secret</button>
                    <div>
                        <h4>Adversaires</h4>
                        {lobby && Object.entries(lobby.players).map(([id, p]) => <div key={id}>{p.name} — {p.progress} essais</div>)}
                    </div>
                </div>
            )}

            {role === "guest" && (
                <div>
                    <p>Salon: <strong>{roomCode}</strong> — Mode: {mode}</p>
                    <p>Attente du host / deviner le code une fois lancé.</p>
                    {/* Utiliser ton composant Board et Row pour faire des essais locaux, puis appeler submitGuess */}
                    <Board />
                </div>
            )}

            <div style={{ marginTop: 16 }}>
                <h4>Avancée adversaire</h4>
                {opponentProgress ? (
                    <div>{opponentProgress.name} : {Array.from({length: opponentProgress.progress}).map((_,i)=>"::").join(" ")} </div>
                ) : <div>Aucun progrès reçu</div>}
            </div>

            <div style={{ marginTop: 16 }}>
                <button onClick={requestRematch}>Demander Rematch</button>
            </div>
        </div>
    );
}