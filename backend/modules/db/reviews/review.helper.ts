import {Prisma} from "../../../generated/prisma/browser.js";

export function isValidFloatRating(value: any): boolean {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 5
    );
}

export async function updateMediaAverageRating(tx: Prisma.TransactionClient, mediaId: string): Promise<void> {

    const allReviews: { rating: number }[] = await tx.reviews.findMany({
        where: {media_id: mediaId},
        select: {rating: true}
    });

    const averageRating: number = allReviews.length > 0
        ? allReviews.reduce((acc: number, rev: { rating: number }): number => acc + rev.rating, 0) / allReviews.length
        : 0;


    await tx.medias.update({
        where: {id: mediaId},
        data: {rating: averageRating}
    });
}