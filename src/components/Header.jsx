import { useState } from "react";
import Modal from "./Modal";
import Settings from "./Settings";
import Stats from "./Stats";
import Help from "./Help";

export default function Header() {
    const [open, setOpen] = useState(null);

    return (
        <>
            <header className="top-bar dark">
                <button className="menu">☰</button>

                <h1>Mastermind</h1>

                <div className="icons">
                    <button onClick={() => setOpen("stats")}>📊</button>
                    <button onClick={() => setOpen("help")}>❓</button>
                    <button onClick={() => setOpen("settings")}>⚙️</button>
                </div>
            </header>

            {open && (
                <Modal onClose={() => setOpen(null)}>
                    {open === "stats" && <Stats />}
                    {open === "help" && <Help />}
                    {open === "settings" && <Settings />}
                </Modal>
            )}
        </>
    );
}
