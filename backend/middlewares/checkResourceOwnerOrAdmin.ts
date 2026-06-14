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
    publicField?: string; // ✅ NOUVEAU : Champ optionnel pour gérer la visibilité
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
        ownerField: 'user_id',
        publicField: 'is_public' // ✅ On indique au middleware quel champ regarder
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
 * Récupère les métadonnées (Propriétaire et Statut public) d'une ressource
 */
async function getResourceMeta(resourceType: ResourceType, resourceId: string): Promise<{ ownerId: string | null, isPublic: boolean }> {
    const config: ResourceConfig = RESOURCE_CONFIG[resourceType];

    if (!config) {
        throw new Error(`Unknown resource type: ${resourceType}`);
    }

    const selectFields: Record<string, boolean> = {
        [config.ownerField]: true
    };

    if (config.publicField) {
        selectFields[config.publicField] = true;
    }

    const resource: any = await config.model.findUnique({
        where: {id: resourceId},
        select: selectFields
    });

    if (!resource) {
        return { ownerId: null, isPublic: false };
    }

    return {
        ownerId: resource[config.ownerField],
        isPublic: config.publicField ? !!resource[config.publicField] : false
    };
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

            const { ownerId, isPublic } = await getResourceMeta(resourceType, resourceId);

            if (!ownerId) {
                throw new NotFound(`${resourceType} not found`);
            }

            if (ownerId === loggedUser.id) {
                return next();
            }

            if (req.method === 'GET' && isPublic) {
                return next();
            }

            throw new Forbidden(`Access denied: you can only modify or access your own private ${resourceType}`);

        } catch (err) {
            next(err);
        }
    };
}