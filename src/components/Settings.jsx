import { useGame } from "../context/GameContext";
import { useTranslation } from "../hooks/useTranslation";

const LANGUAGES = [
    { code: "fr", name: "Français" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" },
];

export default function Settings() {
    const { state, dispatch } = useGame();
    const { t } = useTranslation();

    const toggle = (key) => {
        dispatch({
            type: "UPDATE_SETTINGS",
            settings: { [key]: !state.settings[key] },
        });
    };

    const changeLanguage = (lang) => {
        dispatch({
            type: "UPDATE_SETTINGS",
            settings: { language: lang },
        });
    };

    return (
        <div className="modal-content settings-modal">
            <h2>{t("settings")}</h2>

            <div className="setting">
                <div className="setting-info">
                    <span className="setting-title">{t("language")}</span>
                </div>
                <select
                    className="language-select"
                    value={state.settings.language || "fr"}
                    onChange={(e) => changeLanguage(e.target.value)}
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="setting">
                <div className="setting-info">
                    <span className="setting-title">{t("darkMode")}</span>
                </div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={state.settings.darkMode}
                        onChange={() => toggle("darkMode")}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="setting">
                <div className="setting-info">
                    <span className="setting-title">{t("highContrast")}</span>
                    <span className="setting-desc">{t("highContrastDesc")}</span>
                </div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={state.settings.highContrast}
                        onChange={() => toggle("highContrast")}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="settings-footer">
                <span>Mindster - Sami</span>
            </div>
        </div>
    );
}
