import { PrismaDb } from "../../../config/database.js";

export const getImageUrl = (images: any[]) => {
    if (!images || !images.length) return 'https://via.placeholder.com/300';
    const img = images.find(i => i.size === 'extralarge') || images[images.length - 1];
    return img['#text'];
};

export const getAverageRating = async (mediaId: string): Promise<number> => {
    const aggregate = await PrismaDb.reviews.aggregate({
        where: { media_id: mediaId },
        _avg: { rating: true },
    });
   
    return aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0;
}