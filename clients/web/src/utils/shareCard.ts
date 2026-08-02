const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

export interface ShareCardData {
    artist: string;
    album: string;
    cover?: string;
    rating: number;
    title?: string;
    content?: string;
    userName: string;
    userImage?: string;
}

function loadImage(src?: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        if (!src) {
            resolve(null);
            return;
        }
        const img = new Image();
        // Nécessaire pour pouvoir exporter le canvas ensuite (toDataURL) sans
        // "tainted canvas" — si le serveur distant ne renvoie pas les en-têtes
        // CORS adéquats, l'image échoue simplement à charger (onerror), et on
        // se rabat sur un placeholder plutôt que de planter la génération.
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function drawRoundedImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    size: number,
    radius: number,
): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + size, y, x + size, y + size, radius);
    ctx.arcTo(x + size, y + size, x, y + size, radius);
    ctx.arcTo(x, y + size, x, y, radius);
    ctx.arcTo(x, y, x + size, y, radius);
    ctx.closePath();
    ctx.clip();

    const ratio = Math.max(size / img.width, size / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    ctx.drawImage(img, x + (size - w) / 2, y + (size - h) / 2, w, h);
    ctx.restore();
}

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number,
): number {
    const words = text.split(/\s+/);
    let line = "";
    let lineCount = 0;
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        if (ctx.measureText(testLine).width > maxWidth && line) {
            if (lineCount === maxLines - 1) {
                let truncated = line;
                while (ctx.measureText(`${truncated}…`).width > maxWidth && truncated.length > 0) {
                    truncated = truncated.slice(0, -1);
                }
                ctx.fillText(`${truncated}…`, x, currentY);
                return currentY + lineHeight;
            }
            ctx.fillText(line, x, currentY);
            line = words[i];
            currentY += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }

    if (line) {
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
    }

    return currentY;
}

/**
 * Génère une carte visuelle (PNG en data URL) résumant une critique, pensée
 * pour être partagée hors de l'app (Instagram/Twitter...). Tout est dessiné
 * manuellement sur un <canvas> plutôt que capturé depuis le DOM (via
 * html2canvas par ex.) pour éviter les soucis de polices/CORS d'une capture
 * d'écran, et pour ne pas ajouter de dépendance.
 */
export async function generateReviewShareCard(data: ShareCardData): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    const [coverImg, avatarImg] = await Promise.all([
        loadImage(data.cover),
        loadImage(data.userImage),
    ]);

    // Fond : cover flouté et assombri en plein cadre, ou dégradé de secours
    if (coverImg) {
        ctx.filter = "blur(50px) brightness(0.45) saturate(1.3)";
        const ratio = Math.max(CARD_WIDTH / coverImg.width, CARD_HEIGHT / coverImg.height) * 1.15;
        const w = coverImg.width * ratio;
        const h = coverImg.height * ratio;
        ctx.drawImage(coverImg, (CARD_WIDTH - w) / 2, (CARD_HEIGHT - h) / 2, w, h);
        ctx.filter = "none";
    } else {
        const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, "#a855f7");
        gradient.addColorStop(1, "#ec4899");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    }

    ctx.fillStyle = "rgba(19, 19, 26, 0.55)";
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Cover nette, centrée
    const coverSize = 460;
    const coverX = (CARD_WIDTH - coverSize) / 2;
    const coverY = 120;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    if (coverImg) {
        drawRoundedImage(ctx, coverImg, coverX, coverY, coverSize, 28);
    } else {
        ctx.fillStyle = "#1e1e2d";
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 28);
        ctx.fill();
    }
    ctx.restore();

    let y = coverY + coverSize + 90;

    // Artiste
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "500 34px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(data.artist, CARD_WIDTH / 2, y);
    y += 56;

    // Titre de l'album
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 52px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(data.album, CARD_WIDTH / 2, y);
    y += 70;

    // Étoiles
    const fullStars = Math.round(data.rating);
    ctx.font = "44px Arial";
    ctx.fillStyle = "#fbbf24";
    let starsText = "";
    for (let i = 0; i < 5; i++) starsText += i < fullStars ? "★" : "☆";
    ctx.fillText(starsText, CARD_WIDTH / 2, y);
    y += 80;

    // Extrait de la critique
    if (data.content) {
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.font = "italic 400 34px 'Segoe UI', Arial, sans-serif";
        y = wrapText(ctx, `“${data.content}”`, 100, y, CARD_WIDTH - 200, 46, 5);
        y += 30;
    }

    // Pseudo + avatar, en bas
    const footerY = CARD_HEIGHT - 110;
    const avatarSize = 64;
    const avatarX = CARD_WIDTH / 2 - 140;

    if (avatarImg) {
        drawRoundedImage(ctx, avatarImg, avatarX, footerY - avatarSize / 2, avatarSize, avatarSize / 2);
    } else {
        ctx.fillStyle = "#4f46e5";
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, footerY, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(data.userName.charAt(0).toUpperCase(), avatarX + avatarSize / 2, footerY + 10);
    }

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(data.userName, avatarX + avatarSize + 20, footerY + 10);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("♪ Melodia", CARD_WIDTH - 100, footerY + 10);

    return canvas.toDataURL("image/png");
}
