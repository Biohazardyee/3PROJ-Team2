import {MediaStatus} from '../../generated/prisma/enums.js';

export function isValidMediaStatus(status: any): status is MediaStatus {
    return Object.values(MediaStatus).includes(status);
}