import {PrismaDb} from "../../../config/database.js";
import {BadRequest, Forbidden, NotFound} from "../../../utils/errors.js";
import {isEmptyString, isValidBoolean, isValidStringLength,} from "../../../utils/helpers.js";
import {
    PlaylistAddDto,
    PlaylistCollaboratorDto,
    PlaylistResponseAddDto,
    PlaylistResponseDeleteDto,
    PlaylistResponseDto,
    PlaylistResponseUpdateDto,
    PlaylistUpdateDto,
} from "../../../types/playlists/playlist.dto.js";
import {Playlists, Prisma, Users} from "../../../generated/prisma/client.js";
import {playlistMapper} from "../../../mappers/playlists/playlist.mapper.js";
import {badgeService} from "../badges/badge.service.js";
import {isPlaylistEditor} from "./playlist.helper.js";
import {bufferToImageDataUri} from "../../../utils/imageDataUri.js";
import {notificationService} from "../notifications/notification.service.js";
import {NotificationActions} from "../../../generated/prisma/enums.js";
import {canSendNotification} from "../notifications/notification.helper.js";

const COLLABORATOR_SELECT = {
    id: true,
    username: true,
    pseudo: true,
    profile_picture: true,
} as const;

export class PlaylistService {
    async create(data: PlaylistAddDto): Promise<PlaylistResponseAddDto> {

        if (isEmptyString(data.name)) {
            throw new BadRequest("Playlist name cannot be empty");
        }

        if (!isValidStringLength(data.name.trim(), 100)) {
            throw new BadRequest(`Playlist name is too long (max 100 characters)`);
        }

        if (isEmptyString(data.user_id)) {
            throw new BadRequest("user_id cannot be empty");
        }

        if (!isValidBoolean(data.is_public)) {
            throw new BadRequest("Is_public must be a boolean value");
        }

        let imageData: any = null;

        if (data.image_url && data.image_url.trim() !== "") {
            const base64Data: string = data.image_url.includes("base64,")
                ? data.image_url.split("base64,")[1]
                : data.image_url;

            imageData = Buffer.from(base64Data, "base64");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                id: data.user_id,
            },
        });

        if (!user) {
            throw new BadRequest("User with this id does not exist");
        }

        const cleanName: string = data.name.trim();

        const exists: Playlists | null = await PrismaDb.playlists.findFirst({
            where: {
                user_id: data.user_id,
                name: cleanName,
            },
        });

        if (exists) {
            throw new BadRequest(
                "Playlist with this name already exists for the user",
            );
        }

        const playlist: Playlists = await PrismaDb.playlists.create({
            data: {
                name: data.name,
                user_id: data.user_id,
                is_public: data.is_public,
                image_url: imageData,
                spotify_playlist_id: data.spotify_playlist_id,
            },
        });

        badgeService
            .checkAndAwardBadges(data.user_id)
            .catch((err): void => console.error("Badge check failed:", err));

        return playlistMapper.toAddDto(playlist);
    }

    async getPlaylistsByUserId(id: string, requesterId?: string): Promise<PlaylistResponseDto[]> {
        if (isEmptyString(id)) {
            throw new BadRequest("user_id cannot be empty");
        }

        const user: Users | null = await PrismaDb.users.findUnique({
            where: {
                id: id,
            },
        });

        const userReviews = await PrismaDb.reviews.findMany({
            where: {user_id: id},
            select: {media_id: true, rating: true}
        });

        const reviewMap = new Map(userReviews.map(r => [r.media_id, r.rating]));

        if (!user) {
            throw new BadRequest("User with this id does not exist");
        }

        const isSelf: boolean = requesterId === id;

        const playlists = await PrismaDb.playlists.findMany({
            where: {
                OR: [
                    {user_id: id},
                    {collaborators: {some: {user_id: id}}},
                ],
                ...(isSelf ? {} : {is_public: true}),
            },
            include: {
                items: {
                    include: {media: true}
                },
                collaborators: {
                    include: {user: {select: COLLABORATOR_SELECT}},
                },
            },
            orderBy: {created_at: "desc"},
        });

        return playlists.map((p): PlaylistResponseDto => ({
            ...playlistMapper.toDtoWithRatings(p, reviewMap),
            is_owner: p.user_id === id,
        }));
    }

    async getAll(): Promise<PlaylistResponseDto[]> {
        const playlists: Playlists[] = await PrismaDb.playlists.findMany({
            orderBy: {
                created_at: "asc",
            },
        });

        return playlistMapper.toDtoList(playlists);
    }

    async getById(id: string): Promise<PlaylistResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Playlist id cannot be empty");
        }

        const playlist = await PrismaDb.playlists.findUnique({
            where: {
                id,
            },
            include: {
                items: {
                    include: {
                        media: true
                    }
                },
                collaborators: {
                    include: {user: {select: COLLABORATOR_SELECT}},
                },
            }
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        return playlistMapper.toDto(playlist);
    }

    async addCollaborator(
        playlistId: string,
        requesterId: string,
        username: string,
    ): Promise<PlaylistCollaboratorDto[]> {
        if (isEmptyString(playlistId) || isEmptyString(username)) {
            throw new BadRequest("playlist_id and username are required");
        }

        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {id: playlistId},
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        if (playlist.user_id !== requesterId) {
            throw new Forbidden("Only the playlist owner can manage collaborators");
        }

        const targetUser: Users | null = await PrismaDb.users.findUnique({
            where: {username: username.trim()},
        });

        if (!targetUser) {
            throw new NotFound("User not found");
        }

        if (targetUser.id === playlist.user_id) {
            throw new BadRequest("The owner is already an editor of this playlist");
        }

        const existing = await PrismaDb.playlistCollaborators.findUnique({
            where: {
                playlist_id_user_id: {playlist_id: playlistId, user_id: targetUser.id},
            },
        });

        if (existing) {
            throw new BadRequest("This user is already a collaborator on this playlist");
        }

        await PrismaDb.$transaction([
            PrismaDb.playlistCollaborators.create({
                data: {playlist_id: playlistId, user_id: targetUser.id},
            }),
            PrismaDb.playlists.update({
                where: {id: playlistId},
                data: {is_collaborative: true},
            }),
        ]);

        const isAllowed: boolean = await canSendNotification(
            targetUser.id,
            requesterId,
            "playlist_collaborator_added",
            5,
        );

        if (isAllowed) {
            notificationService
                .create({
                    user_id: targetUser.id,
                    action: NotificationActions.playlist_collaborator_added,
                    related_user_id: requesterId,
                })
                .catch((err): void => console.error("Notification failed:", err));
        }

        return this.getCollaborators(playlistId, requesterId);
    }

    async removeCollaborator(
        playlistId: string,
        requesterId: string,
        targetUserId: string,
    ): Promise<void> {
        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {id: playlistId},
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        if (playlist.user_id !== requesterId) {
            throw new Forbidden("Only the playlist owner can manage collaborators");
        }

        await this.removeCollaboratorInternal(playlistId, targetUserId);
    }

    async leaveCollaboration(playlistId: string, userId: string): Promise<void> {
        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {id: playlistId},
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        if (playlist.user_id === userId) {
            throw new BadRequest("The owner cannot leave their own playlist");
        }

        await this.removeCollaboratorInternal(playlistId, userId);
    }

    private async removeCollaboratorInternal(playlistId: string, userId: string): Promise<void> {
        const existing = await PrismaDb.playlistCollaborators.findUnique({
            where: {
                playlist_id_user_id: {playlist_id: playlistId, user_id: userId},
            },
        });

        if (!existing) {
            throw new NotFound("This user is not a collaborator on this playlist");
        }

        await PrismaDb.playlistCollaborators.delete({
            where: {
                playlist_id_user_id: {playlist_id: playlistId, user_id: userId},
            },
        });

        const remaining: number = await PrismaDb.playlistCollaborators.count({
            where: {playlist_id: playlistId},
        });

        if (remaining === 0) {
            await PrismaDb.playlists.update({
                where: {id: playlistId},
                data: {is_collaborative: false},
            });
        }
    }

    async getCollaborators(
        playlistId: string,
        requesterId: string,
    ): Promise<PlaylistCollaboratorDto[]> {
        if (isEmptyString(playlistId)) {
            throw new BadRequest("playlist_id is required");
        }

        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {id: playlistId},
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        const canView: boolean = await isPlaylistEditor(playlistId, requesterId);
        if (!canView) {
            throw new Forbidden("Access denied");
        }

        const collaborators = await PrismaDb.playlistCollaborators.findMany({
            where: {playlist_id: playlistId},
            include: {user: {select: COLLABORATOR_SELECT}},
            orderBy: {added_at: "asc"},
        });

        return collaborators.map((c): PlaylistCollaboratorDto => ({
            id: c.user.id,
            username: c.user.username,
            pseudo: c.user.pseudo,
            profile_picture: bufferToImageDataUri(c.user.profile_picture),
        }));
    }

    async update(
        id: string,
        data: PlaylistUpdateDto,
    ): Promise<PlaylistResponseUpdateDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {
                id,
            },
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        const updateData: Prisma.PlaylistsUpdateInput = {};

        if (data.name !== undefined) {
            if (isEmptyString(data.name)) {
                throw new BadRequest("Playlist name cannot be empty");
            }

            if (!isValidStringLength(data.name, 100)) {
                throw new BadRequest(
                    `Playlist name is too long (max ${100} characters)`,
                );
            }

            const exists: Playlists | null = await PrismaDb.playlists.findFirst({
                where: {
                    name: data.name.trim(),
                    user_id: playlist.user_id,
                    NOT: {
                        id: id,
                    },
                },
            });

            if (exists) {
                throw new BadRequest(
                    "Playlist with this name already exists for the user",
                );
            }

            updateData.name = data.name.trim();
        }

        if (data.image_url !== undefined) {
            if (data.image_url === null) {
                updateData.image_url = null;
            } else {
                const base64Data: string = data.image_url.replace(
                    /^data:image\/\w+;base64,/,
                    "",
                );
                const buffer: Buffer<ArrayBuffer> = Buffer.from(base64Data, "base64");

                updateData.image_url = Uint8Array.from(buffer);
            }
        }

        if (data.is_public !== undefined) {
            if (!isValidBoolean(data.is_public)) {
                throw new BadRequest("Is_public must be a boolean value");
            }

            updateData.is_public = data.is_public;
        }

        const updatedPlaylist: Playlists = await PrismaDb.playlists.update({
            where: {
                id,
            },
            data: updateData,
        });

        return playlistMapper.toUpdateDto(updatedPlaylist);
    }

    async delete(id: string): Promise<PlaylistResponseDeleteDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Playlist id cannot be empty");
        }

        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {
                id,
            },
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        const deletePlaylist: Playlists = await PrismaDb.playlists.delete({
            where: {
                id,
            },
        });

        return playlistMapper.toDeleteDto(deletePlaylist);
    }
}
