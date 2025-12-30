import { GameProvider } from "./context/GameContext";
import Game from "./pages/Game";
import { Helmet } from "react-helmet-async";
import "./App.css";

function App() {
    return (
        <GameProvider>

            <Helmet>
                <title>Mindster – Jeu de logique de combinaison de couleurs</title>
                <meta
                    name="description"
                    content="Mindster est un jeu de réflexion où vous devez trouver la bonne combinaison de couleurs en 8 essais. Simple, rapide et addictif."
                />
                <link rel="canonical" href="https://mindster.fr" />
            </Helmet>

            <Game />

        </GameProvider>
    );
}

export default App;
