import {PrismaDb} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';
import {FollowCreateDto, FollowResponseDto} from "../../../types/follows/follows.dto.js";
import {followsMapper} from "../../../mappers/follows/follows.mapper.js";
import {Follows, Prisma, User} from '../../../generated/prisma/client.js';

export class FollowService {

    async create(data: FollowCreateDto): Promise<FollowResponseDto> {

        if (isEmptyString(data.user_id) || isEmptyString(data.follow_user_id)) {
            throw new BadRequest('user_id and follow_user_id cannot be empty');
        }

        if (data.user_id === data.follow_user_id) {
            throw new BadRequest('You cannot follow yourself');
        }


        const [user, target] = await Promise.all([
            PrismaDb.user.findUnique({
                where: {
                    id: data.user_id
                }
            }),
            PrismaDb.user.findUnique({
                where: {
                    id: data.follow_user_id
                }
            }),
        ]);

        if (!user) {
            throw new BadRequest('User not found');
        }

        if (!target) {
            throw new BadRequest('Target user not found');
        }

        const exists: Follows | null = await PrismaDb.follows.findUnique({
            where: {
                user_id_follow_user_id: {
                    user_id: data.user_id,
                    follow_user_id: data.follow_user_id
                }
            },
        });

        if (exists) {
            throw new BadRequest('Already following this user');
        }

        const creationData: Prisma.FollowsUncheckedCreateInput = {
            user_id: data.user_id,
            follow_user_id: data.follow_user_id,
        }

        const followCreation: Follows = await PrismaDb.follows.create({
            data: creationData
        })

        return followsMapper.toDto(followCreation)
    }

    async delete(user_id: string, follow_user_id: string): Promise<FollowResponseDto> {

        if (isEmptyString(user_id) || isEmptyString(follow_user_id)) {
            throw new BadRequest('user_id and follow_user_id cannot be empty');
        }

        try {

            const user: User | null = await PrismaDb.user.findUnique({
                where: {
                    id: user_id
                }
            })

            if (!user) {
                throw new BadRequest('User not found');
            }

            const target_user: User | null = await PrismaDb.user.findUnique({
                where: {
                    id: follow_user_id
                }
            })

            if (!target_user) {
                throw new BadRequest('User not found');
            }

            const following: Follows | null = await PrismaDb.follows.findUnique({
                where: {
                    user_id_follow_user_id: {
                        user_id: user_id,
                        follow_user_id: follow_user_id
                    }
                }
            })

            if (!following) {
                throw new BadRequest('User isnt following the target user');
            }

            const followToDelete: Follows = await PrismaDb.follows.delete({
                where: {
                    user_id_follow_user_id: {
                        user_id: user_id,
                        follow_user_id: follow_user_id
                    }
                }
            })

            return followsMapper.toDto(followToDelete)
        } catch {
            throw new NotFound('Follow relation not found');
        }
    }

    async getFollowers(user_id: string): Promise<FollowResponseDto[]> {
        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                id: user_id
            }
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        const followers: Follows[] = await PrismaDb.follows.findMany({
            where: {
                follow_user_id: user_id
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return followsMapper.toDtoList(followers);
    }

    async getFollowing(user_id: string): Promise<FollowResponseDto[]> {
        if (isEmptyString(user_id)) {
            throw new BadRequest('user_id cannot be empty');
        }

        const user: User | null = await PrismaDb.user.findUnique({
            where: {
                id: user_id
            }
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        const following: Follows[] = await PrismaDb.follows.findMany({
            where: {
                user_id
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return followsMapper.toDtoList(following);
    }
}

export const followService = new FollowService();
