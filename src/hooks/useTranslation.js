import useGame from "../context/GameContext";
import { translations } from "../i18n/translations";

export function useTranslation() {
    const { state } = useGame();
    const lang = state.settings.language || "fr";

    const t = (key, params = {}) => {
        let text = translations[lang]?.[key] || translations.fr[key] || key;

        Object.entries(params).forEach(([param, value]) => {
            text = text.replace(`{${param}}`, value);
        });

        return text;
    };

    return { t, lang };
}
