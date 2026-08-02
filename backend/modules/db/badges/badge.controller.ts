import type {Request, Response, NextFunction} from "express";

import {BadRequest} from "../../../utils/errors.js";
import {BadgeService, badgeService} from "./badge.service.js";

class BadgeController {
    constructor(private readonly service: BadgeService = badgeService) {
    }

    async getCatalog(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const catalog = this.service.getCatalog();
            res.status(200).json({catalog});
        } catch (err) {
            next(err);
        }
    }

    async getUserBadges(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest("User id is required");
            }

            const badges = await this.service.getUserBadgeProgress(req.params.id);
            res.status(200).json({badges});
        } catch (err) {
            next(err);
        }
    }
}

export default new BadgeController();
