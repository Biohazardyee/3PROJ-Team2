import {Request, Response, NextFunction} from 'express';
import {BadRequest, Forbidden, NotFound} from '../utils/errors.js';
import {PrismaDb} from '../config/database.js';

type ResourceType =
    | 'reviews'
    | 'comments'
    | 'users'
    | 'ban_users'
    | 'likes'
    | 'playlists'
    | 'playlist_items'
    | 'notifications'
    | 'messages'
    | 'media_status'
    | 'follows'
    | 'conversations'
    | 'activities'
    | 'reports';

/**
 * Configuration pour chaque type de ressource
 */
interface ResourceConfig {
    model: any;
    ownerField: string;
}

/**
 * Mapping entre les types de ressources et leur configuration
 */
const RESOURCE_CONFIG: Record<ResourceType, ResourceConfig> = {
    reviews: {
        model: PrismaDb.reviews,
        ownerField: 'user_id'
    },
    comments: {
        model: PrismaDb.reviewComments,
        ownerField: 'user_id'
    },
    reports: {
        model: PrismaDb.reports,
        ownerField: 'reporter_id'
    },
    users: {
        model: PrismaDb.users,
        ownerField: 'id'
    },
    ban_users: {
        model: PrismaDb.bannedUsers,
        ownerField: 'user_id'
    },
    likes: {
        model: PrismaDb.reviewLikes,
        ownerField: 'user_id'
    },
    playlists: {
        model: PrismaDb.playlists,
        ownerField: 'user_id'
    },
    notifications: {
        model: PrismaDb.notifications,
        ownerField: 'user_id'
    },
    messages: {
        model: PrismaDb.messages,
        ownerField: 'sender_id'
    },
    media_status: {
        model: PrismaDb.userMediaStatus,
        ownerField: 'user_id'
    },
    follows: {
        model: PrismaDb.follows,
        ownerField: 'user_id'
    },
    conversations: {
        model: PrismaDb.conversations,
        ownerField: 'user_id'
    },
    activities: {
        model: PrismaDb.activities,
        ownerField: 'user_id'
    },
    playlist_items: {
        model: PrismaDb.playlistItems,
        ownerField: 'user_id'
    }
};

/**
 * Récupère l'ID du propriétaire d'une ressource
 */
async function getResourceOwnerId(resourceType: ResourceType, resourceId: string): Promise<string | null> {

    const config: ResourceConfig = RESOURCE_CONFIG[resourceType];

    if (!config) {
        throw new Error(`Unknown resource type: ${resourceType}`);
    }

    const selectFields: Record<string, boolean> = {
        [config.ownerField]: true
    };

    const resource: any = await config.model.findUnique({
        where: {id: resourceId},
        select: selectFields
    });

    if (!resource) {
        return null;
    }

    return resource[config.ownerField];
}

/**
 * Factory pour créer un middleware de vérification de propriété
 */
export function checkResourceOwnerOrAdmin(resourceType: ResourceType) {
    return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
        try {
            const loggedUser = req.user;

            if (!loggedUser) {
                throw new BadRequest("User not authenticated");
            }

            const resourceId: string = req.params.id;

            if (!resourceId) {
                throw new BadRequest(`${resourceType} ID is required`);
            }

            if (loggedUser.role === 'ADMIN') {
                return next();
            }

            const ownerId: string | null = await getResourceOwnerId(resourceType, resourceId);

            if (!ownerId) {
                throw new NotFound(`${resourceType} not found`);
            }

            if (ownerId === loggedUser.id) {
                return next();
            }

            throw new Forbidden(`Access denied: you can only modify your own ${resourceType}`);

        } catch (err) {
            next(err);
        }
    };
}