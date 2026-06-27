import {useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import apiClient from "../api/client";
import {setOwnedThemes} from "../useDarkMode";

/**
 * Récupère la possession des cosmétiques auprès du serveur et la transmet à
 * `setOwnedThemes`, qui est la SEULE source autorisant l'affichage d'un thème
 * premium. Tant que ce n'est pas confirmé, un thème premium reste en sombre —
 * impossible donc de l'activer en modifiant le localStorage.
 */
const ThemeGuard = (): null => {
    useEffect(() => {
        const validate = async (): Promise<void> => {
            const token: string | null = localStorage.getItem("token");
            if (!token) {
                setOwnedThemes([]); // non connecté -> aucune possession
                return;
            }
            try {
                const decoded: any = jwtDecode(token);
                const uId: string = decoded.id || decoded.userId;
                const res = await apiClient.get(`/users/public/${uId}`);
                const data = res.data.user || res.data;
                setOwnedThemes(data.owned_cosmetics || []);
            } catch {
                setOwnedThemes([]);
            }
        };

        validate();
        window.addEventListener("auth-changed", validate);
        return () => window.removeEventListener("auth-changed", validate);
    }, []);

    return null;
};

export default ThemeGuard;
