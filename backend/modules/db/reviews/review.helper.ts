import { Prisma } from "../../../generated/prisma/browser.js";

export function isValidFloatRating(value: any): boolean {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 5
    );
}

export function normalizeRating(value: number): number {
    return Math.round(value * 10) / 10;
}

export async function updateMediaAverageRating(tx: Prisma.TransactionClient, mediaId: string) {
  
    const allReviews = await tx.reviews.findMany({
        where: { media_id: mediaId },
        select: { rating: true }
    });

    const averageRating = allReviews.length > 0
        ? allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length
        : 0;

   
    await tx.medias.update({
        where: { id: mediaId },
        data: { rating: averageRating }
    });
}