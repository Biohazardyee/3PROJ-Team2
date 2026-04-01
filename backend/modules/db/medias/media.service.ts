import { PrismaDb } from "../../../config/database.js";
import { NotFound, BadRequest } from "../../../utils/errors.js";
import { isEmptyString, isValidApiId } from "../../../utils/helpers.js";
import {
  MediaCreateDto,
  MediaResponseDto,
  MediaUpdateDto,
} from "../../../types/medias/media.dto.js";
import { Medias } from "../../../generated/prisma/browser.js";
import { mediaMapper } from "../../../mappers/medias/media.mapper.js";
import { Prisma } from "../../../generated/prisma/client.js";

export class MediaService {
  async create(data: MediaCreateDto) {
    if (isEmptyString(data.api_id)) {
      throw new BadRequest("API ID cannot be empty");
    }

    const exists: Medias | null = await PrismaDb.medias.findFirst({
      where: {
        api_id: data.api_id,
      },
    });

    if (exists) {
      throw new BadRequest("Media with this API ID already exists");
    }

    const media: Medias = await PrismaDb.medias.create({
      data,
    });

    return mediaMapper.toDto(media);
  }

  async getAll(): Promise<MediaResponseDto[]> {
    const medias: Medias[] = await PrismaDb.medias.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return mediaMapper.toDtoList(medias);
  }

  async getById(identifier: string): Promise<MediaResponseDto> {
    if (isEmptyString(identifier)) {
      throw new BadRequest("Identifier cannot be empty");
    }

    const media = await PrismaDb.medias.findFirst({
      where: {
        OR: [
          { id: identifier }, // Si c'est un UUID de ta DB
          { api_id: identifier }, // Si c'est le mbid ou le format "album:artiste"
        ],
      },
    });

    if (!media) {
      throw new NotFound("Media not found in local database");
    }

    return mediaMapper.toDto(media);
  }

  async update(id: string, data: MediaUpdateDto): Promise<MediaResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("Media id is required");
    }

    const media: Medias | null = await PrismaDb.medias.findUnique({
      where: {
        id,
      },
    });

    if (!media) {
      throw new NotFound("Media not found");
    }

    const updateData: Prisma.MediasUpdateInput = {};

    if (data.api_id !== undefined) {
      if (!isValidApiId(data.api_id)) {
        throw new BadRequest("Invalid api_id provided");
      }
      updateData.api_id = data.api_id;
    }

    const updateMedia: Medias = await PrismaDb.medias.update({
      where: {
        id,
      },
      data: updateData,
    });

    return mediaMapper.toDto(updateMedia);
  }

  async delete(id: string): Promise<MediaResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("Media id cannot be empty");
    }

    const media: Medias | null = await PrismaDb.medias.findUnique({
      where: {
        id,
      },
    });

    if (!media) {
      throw new NotFound("Media not found");
    }

    const deletedMedia: Medias = await PrismaDb.medias.delete({
      where: {
        id,
      },
    });

    return mediaMapper.toDto(deletedMedia);
  }

  async getByApiIds(apiIds: string[]): Promise<MediaResponseDto[]> {
    if (!Array.isArray(apiIds) || apiIds.length === 0) {
      return [];
    }

    const medias = await PrismaDb.medias.findMany({
      where: {
        api_id: { in: apiIds },
      },
    });

    if (medias.length === 0) return [];

    const ratings = await PrismaDb.reviews.groupBy({
      by: ["media_id"],
      _avg: {
        rating: true,
      },
      where: {
        media_id: { in: medias.map((m) => m.id) },
      },
    });

    const mediasWithRatings = medias.map((media) => {
      const avgData = ratings.find((r) => r.media_id === media.id);
      return {
        ...media,
        rating: avgData?._avg?.rating || 0,
      };
    });

    return mediaMapper.toDtoList(mediasWithRatings);
  }

  async syncSearchResults(albums: any[]): Promise<any[]> {
    if (!Array.isArray(albums) || albums.length === 0) {
      throw new BadRequest("'albums' array is required");
    }

    return await Promise.all(
      albums.map(async (album: any) => {
        const { api_id, name, artist, cover, mbid } = album;

        // Harmonisation de l'api_id de secours
        // On utilise le format : "album:Artiste:Nom" (le même que ton frontend)
        const fallbackId = `album:${artist}:${name}`;
        const targetId = api_id || fallbackId;

        let media = await PrismaDb.medias.findFirst({
          where: {
            OR: [{ api_id: targetId }, { api_id: fallbackId }],
          },
        });

        if (!media) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          media = await PrismaDb.medias.create({
            data: {
              api_id: targetId,
              content: { name, artist, cover, mbid: mbid || null },
              expires_at: expiresAt,
            },
          });
        }

        // Récupérer la note moyenne
        const ratings = await PrismaDb.reviews.aggregate({
          where: { media_id: media.id },
          _avg: { rating: true },
        });

        const avgRating = ratings._avg?.rating || 0;

        return {
          id: media.id,
          api_id: media.api_id,
          name: name,
          artist: artist,
          cover: cover,
          rating: Math.round(avgRating * 10) / 10,
          mbid: mbid || null,
        };
      }),
    );
  }
}
