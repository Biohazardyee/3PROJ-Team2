import type { Request, Response, NextFunction } from "express";

import { Controller } from "../../controller.js";
import { BadRequest } from "../../../utils/errors.js";
import { ReviewService } from "./review.service.js";
import {
  ReviewAddDto,
  ReviewResponseAddDto,
  ReviewResponseDeleteDto,
  ReviewResponseDto,
  ReviewUpdateDto,
  ReviewWithMediaDto,
} from "../../../types/reviews/review.dto.js";

class ReviewController extends Controller {
  constructor(private readonly service = new ReviewService()) {
    super();
  }

  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createData: ReviewAddDto = {
        user_id: req.body.user_id,
        media_id: req.body.media_id,
        rating: req.body.rating,
        title: req.body.title,
        content: req.body.content,
      };

      if (
        !createData.user_id ||
        !createData.media_id ||
        createData.rating === undefined ||
        !createData.content
      ) {
        throw new BadRequest("User_id, media_id, rating & content is required");
      }

      const review: ReviewResponseAddDto =
        await this.service.create(createData);

      res.status(201).json({
        message: "Review created successfully",
        review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const reviews = await this.service.getAll(userId);

      res.status(200).json({
        message: "Reviews retrieved successfully",
        reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.params.id) {
        throw new BadRequest("Id is required");
      }

      const userId = (req as any).user?.id;

      const review: ReviewResponseDto = await this.service.getById(
        req.params.id,
        userId,
      );

      res.status(200).json({
        message: "Review retrieved successfully",
        review,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id: string = req.params.id;

      if (!id) {
        throw new BadRequest("Id is required");
      }

      const updateData: ReviewUpdateDto = {};

      if (req.body.rating !== undefined) {
        updateData.rating = req.body.rating;
      }

      if (req.body.title !== undefined) {
        updateData.title = req.body.title;
      }

      if (req.body.content !== undefined) {
        updateData.content = req.body.content;
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequest("No fields provided");
      }

      const review: ReviewResponseDto = await this.service.update(
        id,
        updateData,
      );

      res.status(201).json({
        message: "Review updated successfully",
        review,
      });
    } catch (err) {
      next(err);
    }
  }

  async getTopAlbumsByUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId: string = req.params.userId;

      if (!userId) {
        throw new BadRequest("UserId parameter is required");
      }

      const topAlbums: ReviewWithMediaDto[] =
        await this.service.getTopAlbumsByUser(userId);

      res.status(200).json({
        message: "Top albums retrieved successfully",
        data: topAlbums,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRecentActivity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId: string = req.params.userId;
      const limit: number = parseInt(req.query.limit as string) || 10;
      const offset: number = parseInt(req.query.offset as string) || 0;

      if (!userId) throw new BadRequest("UserId is required");

      const reviews: ReviewWithMediaDto[] =
        await this.service.getUserRecentActivity(userId, limit, offset);

      res.status(200).json({
        message: "Recent activity retrieved",
        data: reviews,
        nextOffset: reviews.length === limit ? offset + limit : null,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.params.id) {
        throw new BadRequest("Id is required");
      }

      const reviewDelete: ReviewResponseDeleteDto = await this.service.delete(
        req.params.id,
      );

      res.status(201).json({
        message: "Review deleted successfully",
        reviewDelete,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
