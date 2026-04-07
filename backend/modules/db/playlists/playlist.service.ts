import { PrismaDb } from "../../../config/database.js";
import { NotFound, BadRequest } from "../../../utils/errors.js";
import {
  isEmptyString,
  isValidBoolean,
  isValidStringLength,
} from "../../../utils/helpers.js";
import {
  PlaylistAddDto,
  PlaylistResponseAddDto,
  PlaylistResponseDeleteDto,
  PlaylistResponseDto,
  PlaylistResponseUpdateDto,
  PlaylistUpdateDto,
} from "../../../types/playlists/playlist.dto.js";
import { Playlists, Reports, Users } from "../../../generated/prisma/client.js";
import { playlistMapper } from "../../../mappers/playlists/playlist.mapper.js";
import { Prisma } from "../../../generated/prisma/client.js";

export class PlaylistService {
  async create(data: PlaylistAddDto): Promise<PlaylistResponseAddDto> {
    console.log("KEYS RECUES:", Object.keys(data));

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
    let imageData: Buffer | null = null;

    if (data.image_url && data.image_url.trim() !== "") {
      const base64Data = data.image_url.includes("base64,")
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

    console.log("Image Data Size:", imageData ? imageData.length : "No image");

    console.log("Données reçues dans le service :", {
      name: data.name,
      hasImage: !!data.image_url,
      imageStart: data.image_url ? data.image_url.substring(0, 50) : "RIEN",
    });

    const playlist: Playlists = await PrismaDb.playlists.create({
      data: {
        name: data.name,
        user_id: data.user_id,
        is_public: data.is_public,
        image_url: imageData,
      },
    });

    return playlistMapper.toAddDto(playlist);
  }

  async getPlaylistsByUserId(id: string): Promise<PlaylistResponseDto[]> {
    if (isEmptyString(id)) {
      throw new BadRequest("user_id cannot be empty");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new BadRequest("User with this id does not exist");
    }

    const playlists: Playlists[] = await PrismaDb.playlists.findMany({
      where: {
        user_id: id,
      },
      include: {
        items: true,
      },
    });

    return playlistMapper.toDtoListFiltered(playlists);
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

    const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
      where: {
        id,
      },
    });

    if (!playlist) {
      throw new NotFound("Playlist not found");
    }

    return playlistMapper.toDto(playlist);
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
        const base64Data = data.image_url.replace(
          /^data:image\/\w+;base64,/,
          "",
        );
        const buffer = Buffer.from(base64Data, "base64");

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
