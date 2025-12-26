// src/App.jsx
import { GameProvider } from "./context/GameContext";
import Game from "./pages/Game";
import "./App.css";

function App() {
    return (
        <GameProvider>
            <Game />
        </GameProvider>
    );
}

export default App;
