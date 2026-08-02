/**
 * Reconstitue une data URI à partir d'une chaîne base64 brute (sans préfixe),
 * en détectant le vrai format de l'image via sa signature (magic bytes) plutôt
 * que de supposer un type fixe -- indispensable pour que les GIF animés restent
 * animés (et pas silencieusement réinterprétés en JPEG, ce qui casse l'animation).
 */
export const toImageDataUri = (raw?: string | null): string | null => {
    if (!raw) return null;
    if (raw.startsWith("data:") || raw.startsWith("http")) return raw;

    let mime = "image/jpeg";
    if (raw.startsWith("R0lGOD")) mime = "image/gif";
    else if (raw.startsWith("iVBORw0KG")) mime = "image/png";
    else if (raw.startsWith("UklGR")) mime = "image/webp";

    return `data:${mime};base64,${raw}`;
};
