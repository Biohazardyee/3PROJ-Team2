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
        // Compteur de requête : "auth-changed" peut se redéclencher avant que
        // la validation précédente n'ait fini de résoudre (logout suivi d'un
        // login rapide vers un autre compte). Sans ce garde, une réponse
        // périmée pouvait arriver APRÈS la bonne et écraser la possession du
        // nouveau compte, forçant le thème qu'on venait de choisir à
        // retomber en sombre juste après l'avoir sélectionné.
        let latestRequestId = 0;

        const validate = async (): Promise<void> => {
            const requestId: number = ++latestRequestId;
            const token: string | null = localStorage.getItem("token");

            if (!token) {
                if (requestId === latestRequestId) setOwnedThemes([]); // non connecté -> aucune possession
                return;
            }
            try {
                const decoded: any = jwtDecode(token);
                const uId: string = decoded.id || decoded.userId;
                const res = await apiClient.get(`/users/public/${uId}`);
                const data = res.data.user || res.data;
                if (requestId === latestRequestId) {
                    setOwnedThemes(data.owned_cosmetics || []);
                }
            } catch {
                if (requestId === latestRequestId) setOwnedThemes([]);
            }
        };

        validate();
        window.addEventListener("auth-changed", validate);
        return () => window.removeEventListener("auth-changed", validate);
    }, []);

    return null;
};

export default ThemeGuard;
