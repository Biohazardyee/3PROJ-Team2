import {PrismaDb} from '../../../config/database.js';
import {NotFound, BadRequest} from '../../../utils/errors.js';
import {isEmptyString, isValidStringLength} from "../../../utils/helpers.js";
import {Prisma, Users} from '../../../generated/prisma/client.js';
import {
    BannedUserAddDto,
    BannedUserDeleteDto,
    BannedUserResponseDto,
    BannedUserUpdateDto
} from "../../../types/users/banned.user.dto.js";
import {BannedUsers} from "../../../generated/prisma/browser.js";
import {bannedUserMapper} from "../../../mappers/users/banned.user.mapper.js";

export class BanUserService {

    async create(data: BannedUserAddDto): Promise<BannedUserResponseDto> {
        if (isEmptyString(data.user_id)) {
            throw new BadRequest('User id cannot be empty');
        }

        if (isEmptyString(data.content)) {
            throw new BadRequest('Ban reason cannot be empty');
        }

        if (!isValidStringLength(data.content, 255)) {
            throw new BadRequest('Ban reason cannot be longer than 255 chars');
        }

        const user = await PrismaDb.users.findUnique({
            where: {id: data.user_id},
            select: {
                id: true,
                username: true,
                email: true,
            }
        });


        if (!user) {
            throw new NotFound('User not found');
        }

        const alreadyBanned: BannedUsers | null = await PrismaDb.bannedUsers.findUnique({
            where: {user_id: data.user_id}
        });

        if (alreadyBanned) {
            throw new BadRequest('User already banned');
        }

        const [bannedUser] = await PrismaDb.$transaction([
            PrismaDb.bannedUsers.create({
                data: {
                    user_id: user.id,
                    username: user.username,
                    email: user.email,
                    content: data.content,
                }
            }),

            PrismaDb.users.delete({
                where: {id: user.id}
            })
        ]);

        return bannedUserMapper.toAddDto(bannedUser);
    }


    async getAll(): Promise<BannedUserResponseDto[]> {
        const bannedUsers: BannedUsers[] = await PrismaDb.bannedUsers.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });
        return bannedUserMapper.toDtoList(bannedUsers);
    }

    async getById(user_id: string): Promise<BannedUserResponseDto> {

        if (isEmptyString(user_id)) {
            throw new BadRequest('User id cannot be empty');
        }

        const bannedUser: BannedUsers | null = await PrismaDb.bannedUsers.findUnique({
            where: {
                user_id: user_id
            },
        });

        if (!bannedUser) {
            throw new NotFound('Banned user not found');
        }

        return bannedUserMapper.toDto(bannedUser);
    }

    async update(id: string, data: BannedUserUpdateDto): Promise<BannedUserResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Banned user id cannot be empty');
        }

        const bannedUser: BannedUsers | null = await PrismaDb.bannedUsers.findUnique({
            where: {
                id
            }
        });

        if (!bannedUser) {
            throw new NotFound('Banned user not found');
        }

        if (data.content && !isValidStringLength(data.content, 255)) {
            throw new BadRequest("Ban reason content cannot be more than 255 characters");
        }


        const updateBannedUser: BannedUsers = await PrismaDb.bannedUsers.update({
            where: {
                id
            },
            data
        })

        return bannedUserMapper.toAddDto(updateBannedUser)
    }

    async delete(id: string): Promise<BannedUserDeleteDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Ban id cannot be empty');
        }

        try {
            const bannedUser: BannedUsers = await PrismaDb.bannedUsers.delete({
                where: {id},
            });

            return bannedUserMapper.toDeleteDto(bannedUser);

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFound('Ban not found');
                }
            }
            throw error;
        }
    }
}

export const banUserService = new BanUserService();