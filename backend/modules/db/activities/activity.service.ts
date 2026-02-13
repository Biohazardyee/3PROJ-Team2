import {PrismaDb} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';
import { Prisma} from '../../../generated/prisma/client.js';
import {
    ActivityAddDto,
    ActivityDeleteResponseDto,
    ActivityResponseDto
} from '../../../types/activities/activities.dto.js';
import {activityMapper} from '../../../mappers/activities/activities.mapper.js';
import {Activitys} from "../../../generated/prisma/browser.js";


export class ActivityService {

    async create(data: ActivityAddDto): Promise<ActivityResponseDto> {


        if (isEmptyString(data.user_id)) {
            throw new BadRequest('The value of user_id cannot be empty');
        }

        if (!data.action) {
            throw new BadRequest('Invalid activity action');
        }

        const user = await PrismaDb.user.findUnique({
            where: {id: data.user_id},
        });

        if (!user) {
            throw new BadRequest('User not found');
        }

        if (data.target_user_id) {
            if (data.target_user_id === data.user_id) {
                throw new BadRequest('target_user_id cannot be the same as user_id');
            }

            const targetUser = await PrismaDb.user.findUnique({
                where: {id: data.target_user_id},
            });

            if (!targetUser) {
                throw new BadRequest('Target user not found');
            }
        }

        if (data.review_id) {
            const review = await PrismaDb.reviews.findUnique({
                where: {id: data.review_id},
            });

            if (!review) {
                throw new BadRequest('Review not found');
            }
        }

        if (data.media_id) {
            const media = await PrismaDb.medias.findUnique({
                where: {id: data.media_id},
            });

            if (!media) {
                throw new BadRequest('Media not found');
            }
        }

        if (data.rating_from_user !== undefined && data.rating_from_user !== null) {
            if (data.rating_from_user < 0 || data.rating_from_user > 5) {
                throw new BadRequest('rating_from_user must be between 0 and 5');
            }
        }

        const createData: Prisma.ActivitysUncheckedCreateInput = {
            user_id: data.user_id,
            action: data.action,
            target_user_id: data.target_user_id || null,
            review_id: data.review_id || null,
            media_id: data.media_id || null,
            rating_from_user: data.rating_from_user !== undefined ? data.rating_from_user : null,
        };

        const activity = await PrismaDb.activitys.create({
            data: createData,
        });

        return activityMapper.toDto(activity);
    }

    // async getByUserFeed(user_id: string) {
    //
    //     if (isEmptyString(user_id)) {
    //         throw new BadRequest('The value of user_id cannot be empty');
    //     }
    //
    //
    //     const user: User | null = await PrismaDb.user.findUnique({
    //         where: {
    //             id: user_id
    //         }
    //     });
    //
    //     if (!user) {
    //         throw new NotFound('User not found')
    //     }
    //
    //     const following: {follow_user_id: string}[] = await PrismaDb.follows.findMany({
    //         where: { user_id },
    //         select: { follow_user_id: true },
    //     });
    //
    //     const userIds: string[] = [user_id, ...following.map(f => f.follow_user_id)];
    //
    //     const activities: Activitys[] | null = await PrismaDb.activitys.findMany({
    //         where: {
    //             user_id: {
    //                 in: userIds
    //             }
    //         },
    //     });
    //
    //     return activityMapper.toGetUserFeedDto(activities)
    // }

    async delete(id: string): Promise<ActivityDeleteResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id cannot be empty');
        }

        try {
            const activityToDelete: Activitys | null = await PrismaDb.activitys.delete(
                {
                    where: {
                        id
                    },
                })

            if (!activityToDelete) {
                throw new BadRequest('Activity not found');
            }


           return activityMapper.ToDeleteDto(activityToDelete)
        } catch(error) {
            throw error;
        }
    }

    async getAll(): Promise<ActivityResponseDto[]> {

        const activities: Activitys[] = await PrismaDb.activitys.findMany({
            orderBy: {
                created_at: 'desc'
            }
        })

        return activityMapper.toDtoList(activities);
    }

    async getById(id: string): Promise<ActivityResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Activity id cannot be empty');
        }

        const activity: Activitys | null = await PrismaDb.activitys.findUnique({
            where: {id},
        });

        if (!activity) {
            throw new NotFound('Activity not found');
        }

        return activityMapper.toDto(activity);
    }
}

export const activityService = new ActivityService();
