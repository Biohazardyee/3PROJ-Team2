import { PrismaDb } from "../../../config/database.js";
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString } from "../../../utils/helpers.js";
import {
  FollowCreateDto,
  FollowResponseDto,
} from "../../../types/follows/follows.dto.js";
import { followsMapper } from "../../../mappers/follows/follows.mapper.js";
import { Follows, Users } from "../../../generated/prisma/client.js";
import {
  ensureConversation,
  deleteByParticipants,
} from "../conversations/conversation.helpers.js";
import { notificationService } from "../notifications/notification.service.js";
import { NotificationActions } from "../../../generated/prisma/enums.js";
import { canSendNotification } from "../notifications/notification.helper.js";

export class FollowService {
  async create(data: FollowCreateDto): Promise<FollowResponseDto> {
    if (isEmptyString(data.user_id) || isEmptyString(data.follow_user_id)) {
      throw new BadRequest("user_id and follow_user_id cannot be empty");
    }

    if (data.user_id === data.follow_user_id) {
      throw new BadRequest("You cannot follow yourself");
    }

    const [user, target] = await Promise.all([
      PrismaDb.users.findUnique({ where: { id: data.user_id } }),
      PrismaDb.users.findUnique({ where: { id: data.follow_user_id } }),
    ]);

    if (!user || !target) {
      throw new BadRequest("User or Target not found");
    }

    const exists = await PrismaDb.follows.findUnique({
      where: {
        user_id_follow_user_id: {
          user_id: data.user_id,
          follow_user_id: data.follow_user_id,
        },
      },
    });

    if (exists) {
      throw new BadRequest("Already following this user");
    }

    return await PrismaDb.$transaction(async (tx) => {
      const followCreation = await tx.follows.create({
        data: {
          user_id: data.user_id,
          follow_user_id: data.follow_user_id,
        },
      });

      await ensureConversation(data.user_id, data.follow_user_id, tx);

      const isAllowed = await canSendNotification(
        data.follow_user_id,
        data.user_id,
        "new_follow",
        10, // Cooldown plus long pour un follow
      );

      if (isAllowed) {
        notificationService
          .create({
            user_id: data.follow_user_id,
            action: NotificationActions.new_follow,
            related_user_id: data.user_id,
          })
          .catch((err) =>
            console.error("Failed to process follow notification:", err),
          );
      }

      return followsMapper.toDto(followCreation);
    });
  }

  async delete(
    user_id: string,
    follow_user_id: string,
  ): Promise<FollowResponseDto> {
    if (isEmptyString(user_id) || isEmptyString(follow_user_id)) {
      throw new BadRequest("user_id and follow_user_id cannot be empty");
    }

    const following = await PrismaDb.follows.findUnique({
      where: {
        user_id_follow_user_id: {
          user_id: user_id,
          follow_user_id: follow_user_id,
        },
      },
    });

    if (!following) {
      throw new BadRequest("User isnt following the target user");
    }

    return await PrismaDb.$transaction(async (tx) => {
      const followToDelete = await tx.follows.delete({
        where: {
          user_id_follow_user_id: {
            user_id: user_id,
            follow_user_id: follow_user_id,
          },
        },
      });

      await deleteByParticipants(user_id, follow_user_id, tx);

      return followsMapper.toDto(followToDelete);
    });
  }

  async getFollowers(user_id: string): Promise<FollowResponseDto[]> {
    if (isEmptyString(user_id)) {
      throw new BadRequest("user_id cannot be empty");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new NotFound("User not found");
    }

    const followers: Follows[] = await PrismaDb.follows.findMany({
      where: {
        follow_user_id: user_id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return followsMapper.toDtoList(followers);
  }

  async getFollowing(user_id: string): Promise<FollowResponseDto[]> {
    if (isEmptyString(user_id)) {
      throw new BadRequest("user_id cannot be empty");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new NotFound("User not found");
    }

    const following: Follows[] = await PrismaDb.follows.findMany({
      where: {
        user_id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return followsMapper.toDtoList(following);
  }
}

export const followService = new FollowService();
