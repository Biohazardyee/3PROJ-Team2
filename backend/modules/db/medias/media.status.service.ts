import { PrismaDb } from "../../../config/database.js";
import { NotFound, BadRequest } from "../../../utils/errors.js";
import { isEmptyString } from "../../../utils/helpers.js";
import { isValidMediaStatus } from "./media.status.helper.js";
import { MediaStatus } from "../../../generated/prisma/enums.js";
import {
  MediaStatusCreateDto,
  MediaStatusResponseDto,
  MediaStatusUpdateDto,
} from "../../../types/medias/media.status.dto.js";
import {
  Users,
  Medias,
  UserMediaStatus,
} from "../../../generated/prisma/browser.js";
import { mediaStatusMapper } from "../../../mappers/medias/media.status.mapper.js";

export class MediaStatusService {
  async create(data: MediaStatusCreateDto): Promise<MediaStatusResponseDto> {
    if (isEmptyString(data.user_id)) {
      throw new BadRequest("User_id cannot be empty");
    }

    if (isEmptyString(data.media_id)) {
      throw new BadRequest("Media_id cannot be empty");
    }

    if (!isValidMediaStatus(data.status)) {
      throw new BadRequest("Invalid media status");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: data.user_id,
      },
    });

    if (!user) {
      throw new BadRequest("User with this id does not exist");
    }

    const media: Medias | null = await PrismaDb.medias.findUnique({
      where: {
        id: data.media_id,
      },
    });

    if (!media) {
      throw new BadRequest("Media with this id does not exist");
    }

    const alreadyHasStatus: UserMediaStatus | null =
      await PrismaDb.userMediaStatus.findUnique({
        where: {
          user_id_media_id: {
            user_id: data.user_id,
            media_id: data.media_id,
          },
        },
      });

    if (alreadyHasStatus) {
      throw new BadRequest(
        "User already has a status for this media. Use update instead",
      );
    }

    const userMediaStatus: UserMediaStatus =
      await PrismaDb.userMediaStatus.create({
        data,
      });

    return mediaStatusMapper.toDto(userMediaStatus);
  }

  async getAll(): Promise<MediaStatusResponseDto[]> {
    const mediasStatus: UserMediaStatus[] =
      await PrismaDb.userMediaStatus.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

    return mediaStatusMapper.toDtoList(mediasStatus);
  }

  async getById(
    user_id: string,
    media_id: string,
  ): Promise<MediaStatusResponseDto> {
    try {
      const mediaStatus = await PrismaDb.userMediaStatus.findUnique({
        where: {
          user_id_media_id: { user_id, media_id },
        },
        include: {
          media: true,
        },
      });

      if (!mediaStatus) {
        return mediaStatusMapper.toDto({
          user_id,
          media_id,
          status: "none",
          created_at: new Date(),
          media: null,
        });
      }

      return mediaStatusMapper.toDto(mediaStatus);
    } catch (error) {
      console.error("Erreur silencieuse MediaStatus:", error);
      return mediaStatusMapper.toDto({
        user_id,
        media_id,
        status: "none",
        created_at: new Date(),
        media: null,
      });
    }
  }

  async update(
    user_id: string,
    media_id: string,
    data: MediaStatusUpdateDto,
  ): Promise<MediaStatusResponseDto> {
    // 1. Validation de base
    if (isEmptyString(user_id) || isEmptyString(media_id)) {
      throw new BadRequest("User_id and Media_id are required");
    }

    // 2. Recherche du média (tentative par ID UUID, puis par api_id)
    let media = await PrismaDb.medias.findUnique({
      where: { id: media_id },
    });

    if (!media) {
      // On cherche dans api_id car c'est là que tu stockes "album:Linkin Park:..."
      media = await PrismaDb.medias.findUnique({
        where: { api_id: media_id },
      });
    }

    if (!media) {
      throw new BadRequest(
        "Le média doit d'abord être enregistré en base de données.",
      );
    }

    // 3. Upsert avec les bons types
    // On force le type pour satisfaire TS : data.status as MediaStatus
    const mediaStatus = await PrismaDb.userMediaStatus.upsert({
      where: {
        user_id_media_id: {
          user_id: user_id,
          media_id: media.id,
        },
      },
      update: {
        status: data.status as MediaStatus,
      },
      create: {
        user_id: user_id,
        media_id: media.id,
        status: data.status as MediaStatus,
      },
    });
    return mediaStatusMapper.toDto(mediaStatus);
  }

  async getByUserId(user_id: string): Promise<MediaStatusResponseDto[]> {
    if (isEmptyString(user_id)) {
      throw new BadRequest("User_id cannot be empty");
    }

    const mediasStatus = await PrismaDb.userMediaStatus.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        media: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return mediaStatusMapper.toDtoList(mediasStatus);
  }

  async delete(
    user_id: string,
    media_id: string,
  ): Promise<MediaStatusResponseDto> {
    if (isEmptyString(user_id)) {
      throw new BadRequest("User_id cannot be empty");
    }

    if (isEmptyString(media_id)) {
      throw new BadRequest("Media_id cannot be empty");
    }

    const mediaStatus: UserMediaStatus | null =
      await PrismaDb.userMediaStatus.findUnique({
        where: {
          user_id_media_id: {
            user_id,
            media_id,
          },
        },
      });

    if (!mediaStatus) {
      throw new NotFound("Media status not found");
    }

    const deleteMediaStatus: UserMediaStatus =
      await PrismaDb.userMediaStatus.delete({
        where: {
          user_id_media_id: {
            user_id,
            media_id,
          },
        },
      });

    return mediaStatusMapper.toDto(deleteMediaStatus);
  }
}
