import useGame from "../context/GameContext";
import Row from "./Row";

export default function Board() {
    const { state } = useGame();
    const codeLength = state.mode === "extreme" ? 8 : state.mode === "hard" ? 6 : state.mode === "easy" ? 3 : 4;

    return (
        <section className="board">
            {Array.from({ length: state.maxAttempts }).map((_, i) => {
                const isCurrentRow = i === state.attempts.length;
                const attempt = state.attempts[i];
                const colors = attempt
                    ? attempt.colors
                    : isCurrentRow
                        ? state.currentAttempt
                        : [];
                const feedback = attempt?.feedback;

                return (
                    <Row
                        key={i}
                        colors={colors}
                        feedback={feedback}
                        slots={codeLength}
                        inactive={i > state.attempts.length}
                        isCurrent={isCurrentRow && state.gameStatus === "playing"}
                    />
                );
            })}
        </section>
    );
}