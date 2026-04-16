import {PrismaDb} from "../../../config/database.js";
import {NotFound, BadRequest} from "../../../utils/errors.js";
import {isEmptyString, isValidStringLength} from "../../../utils/helpers.js";
import {
    isValidFloatRating,
    updateMediaAverageRating,
} from "./review.helper.js";
import {
    ReviewAddDto,
    ReviewResponseAddDto,
    ReviewResponseDeleteDto,
    ReviewResponseDto,
    ReviewUpdateDto,
    ReviewWithMediaDto,
} from "../../../types/reviews/review.dto.js";
import {Prisma} from "../../../generated/prisma/client.js";
import {Medias, Users, Reviews} from "../../../generated/prisma/browser.js";
import {reviewMapper} from "../../../mappers/reviews/review.mapper.js";

export class ReviewService {
    async create(data: ReviewAddDto): Promise<ReviewResponseAddDto> {
        if (isEmptyString(data.user_id)) {
            throw new BadRequest("user_id cannot be empty");
        }

        if (isEmptyString(data.media_id)) {
            throw new BadRequest("media_id cannot be empty");
        }

        if (!isValidFloatRating(data.rating)) {
            throw new BadRequest("Rating must be a float between 0 and 5");
        }

        if (isEmptyString(data.content)) {
            throw new BadRequest("Content cannot be empty");
        }

        if (!isValidStringLength(data.content, 1000)) {
            throw new BadRequest("Content is too long (max 1000 characters)");
        }

        if (isEmptyString(data.title)) {
            throw new BadRequest("Title cannot be empty");
        }

        if (!isValidStringLength(data.title, 100)) {
            throw new BadRequest("Title is too long (max 100 characters)");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {id: data.user_id},
        });

        if (!user) {
            throw new BadRequest("User with this id does not exist");
        }


        const media: Medias | null = await PrismaDb.medias.findFirst({
            where: {
                OR: [
                    {id: data.media_id},
                    {api_id: data.media_id},
                ],
            },
        });

        if (!media) {
            throw new BadRequest("Media with this id does not exist");
        }


        const realMediaId = media.id;


        const alreadyReviewed: Reviews | null = await PrismaDb.reviews.findFirst({
            where: {
                user_id: data.user_id,
                media_id: realMediaId,
            },
        });

        if (alreadyReviewed) {
            throw new BadRequest("User has already reviewed this media");
        }

        // 5. Lancer la transaction avec realMediaId
        const review = await PrismaDb.$transaction(async (tx) => {
            const newReview = await tx.reviews.create({
                data: {
                    user_id: data.user_id,
                    media_id: realMediaId,
                    rating: data.rating,
                    title: data.title,
                    content: data.content,
                },
            });

            await tx.activities.create({
                data: {
                    user_id: data.user_id,
                    action: "review_created",
                    review_id: newReview.id,
                    media_id: realMediaId,
                },
            });

            await updateMediaAverageRating(tx, realMediaId);

            return newReview;
        });

        return reviewMapper.toAddDto(review);
    }

    async getAll(userId?: string): Promise<ReviewWithMediaDto[]> {
        const reviews = await PrismaDb.reviews.findMany({
            include: {
                media: true,
                user: true,
                likes: true, // Important pour le .some() plus bas
                _count: {
                    select: {comments: true, likes: true},
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        // Correction de la boucle map
        return reviews.map((review) => {
            const dto = reviewMapper.toReviewWithMediaDto(review);
            return {
                ...dto,
                isLiked: userId
                    ? review.likes.some((l) => l.user_id === userId)
                    : false,
                likes_count: review._count.likes,
            };
        });
    }

    async getById(id: string, userId?: string): Promise<ReviewResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Review id cannot be empty");
        }

        const review: Reviews = await PrismaDb.reviews.findUnique({
            where: {id},
            include: {
                user: true,
                media: true,
                likes: true,
                _count: {
                    select: {likes: true},
                },
            },
        });

        if (!review) {
            throw new NotFound("Review not found");
        }

        let isLiked: boolean = false;
        if (userId) {
            const like = await PrismaDb.reviewLikes.findUnique({
                where: {
                    user_id_review_id: {
                        user_id: userId,
                        review_id: id,
                    },
                },
            });
            isLiked = !!like;
        }

        const dto = reviewMapper.toDto(review);
        return {
            ...dto,
            isLiked: isLiked,
            likes_count: review._count.likes,
        };
    }

    async getTopAlbumsByUser(userId: string): Promise<ReviewWithMediaDto[]> {
        if (isEmptyString(userId)) {
            throw new BadRequest("User id cannot be empty");
        }

        const topReviews = await PrismaDb.reviews.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                rating: 'desc' // Les meilleures notes en premier
            },
            take: 5, // On limite à 5 résultats
            include: {
                media: true
            }
        });

        // On utilise ton mapper existant pour formater la donnée proprement
        return reviewMapper.toReviewWithMediaDtoList(topReviews as any);
    }

    async getUserRecentActivity(userId: string, limit: number, offset: number): Promise<ReviewWithMediaDto[]> {
        if (isEmptyString(userId)) {
            throw new BadRequest("User id cannot be empty");
        }

        const reviews = await PrismaDb.reviews.findMany({
            where: {user_id: userId},
            orderBy: {created_at: 'desc'},
            take: limit,
            skip: offset,
            include: {
                media: true,
                _count: {select: {comments: true, likes: true}}
            }
        });

        return reviewMapper.toReviewWithMediaDtoList(reviews as any);
    }

    async update(id: string, data: ReviewUpdateDto): Promise<ReviewResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Review id cannot be empty");
        }

        const review: Reviews | null = await PrismaDb.reviews.findUnique({
            where: {
                id,
            },
        });

        if (!review) {
            throw new NotFound("Review not found");
        }

        const updateData: Prisma.ReviewsUpdateInput = {};

        if (data.rating !== undefined) {
            if (!isValidFloatRating(data.rating)) {
                throw new BadRequest("Rating must be a float between 0 and 5");
            }

            updateData.rating = data.rating;
        }

        if (data.title !== undefined) {
            if (isEmptyString(data.title))
                throw new BadRequest("Title cannot be empty");
            updateData.title = data.title.trim();
        }

        if (data.content !== undefined) {
            if (isEmptyString(data.content)) {
                throw new BadRequest("Content is required");
            }
            if (!isValidStringLength(data.content, 1000)) {
                throw new BadRequest("Content is too long (max 1000 characters)");
            }

            updateData.content = data.content.trim();
        }

        const reviewUpdate = await PrismaDb.$transaction(async (tx) => {
            const updated = await tx.reviews.update({
                where: {id},
                data: updateData,
            });

            if (data.rating !== undefined) {
                await updateMediaAverageRating(tx, updated.media_id);
            }

            return updated;
        });

        return reviewMapper.toDto(reviewUpdate);
    }

    async delete(id: string): Promise<ReviewResponseDeleteDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Review id cannot be empty");
        }

        const review: Reviews | null = await PrismaDb.reviews.findUnique({
            where: {
                id,
            },
        });

        if (!review) {
            throw new NotFound("Review not found");
        }

        const reviewToDelete = await PrismaDb.$transaction(async (tx) => {
            const deleted = await tx.reviews.delete({
                where: {id},
            });

            await updateMediaAverageRating(tx, deleted.media_id);

            return deleted;
        });

        return reviewMapper.toDeleteDto(reviewToDelete);
    }
}
