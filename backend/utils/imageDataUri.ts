/**
 * Construit une data URI à partir des octets bruts d'une image en détectant
 * le vrai format via sa signature (magic bytes) plutôt que de supposer un
 * type fixe -- indispensable pour qu'un GIF de profil animé reste animé une
 * fois renvoyé par l'API (sinon il est silencieusement réinterprété en JPEG).
 */
export function bufferToImageDataUri(buffer?: Uint8Array | Buffer | null): string | null {
    if (!buffer || buffer.length < 4) return null;

    const buf: Buffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    let mime = 'image/jpeg';
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
        mime = 'image/gif';
    } else if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
        mime = 'image/png';
    } else if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
        mime = 'image/webp';
    }

    return `data:${mime};base64,${buf.toString('base64')}`;
}
