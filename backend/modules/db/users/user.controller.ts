import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { Controller } from "../../controller.js";
import { Unauthorized, BadRequest } from "../../../utils/errors.js";
import { UserService, userService } from "./user.service.js";
import { userMapper } from "../../../mappers/users/user.mapper.js";

import type {
  SelectableUserField,
  PartialUserResponseDto,
} from "../../../types/users/user.dto.js";

import {
  LoginDto,
  UserRegistrationDto,
  UserResponseAddDto,
  UserResponseDeleteDto,
  UserResponseDto,
  UserResponseLoginDto,
  UserUpdateDto,
} from "../../../types/users/user.dto.js";
import { Users } from "../../../generated/prisma/client.js";

dotenv.config();

class UserController extends Controller {
  constructor(private readonly service: UserService = userService) {
    super();
  }

  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrationData: UserRegistrationDto = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        favorite_band: req.body.favorite_band,
        profile_picture: req.body.profile_picture,
      };

      if (
        !registrationData.email ||
        !registrationData.username ||
        !registrationData.password ||
        !registrationData.favorite_band
      ) {
        throw new BadRequest(
          "Email, username, password & favorite band are required",
        );
      }

      const user: UserResponseAddDto = await this.service.add(registrationData);

      const token: string = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: registrationData.email.trim().toLowerCase(),
          role: "USER",
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "24h",
        },
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData: LoginDto = {
        email: req.body.email,
        password: req.body.password,
      };

      if (!loginData.email || !loginData.password) {
        throw new BadRequest("Email, password and is_oauth are required");
      }

      const user: Users | null = await this.service.getByEmailForAuth(
        loginData.email,
      );

      if (!user) {
        throw new Unauthorized("Invalid email or password");
      }

      if (user.password != null) {
        const isValid: boolean = await bcrypt.compare(
          loginData.password,
          user.password,
        );

        if (!isValid) {
          throw new Unauthorized("Invalid email or password");
        }
      } else {
        throw new Unauthorized(
          "User registered via OAuth, please login with the corresponding provider",
        );
      }

      const token: string = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "24h",
        },
      );

      const userResponse: UserResponseLoginDto = userMapper.toLoginDto(user);

      res.json({
        message: "Login successful",
        token,
        user: userResponse,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users: UserResponseDto[] = await this.service.getAll();
      res.status(201).json({
        message: "All users retrieved",
        users,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /users/fields?fields=id,username,biography
   * Récupère tous les utilisateurs avec seulement les champs spécifiés
   */
  async getAllWithFields(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fieldsParam = req.query.fields as string;

      if (!fieldsParam) {
        throw new BadRequest(
          "Fields query parameter is required (e.g., ?fields=id,username,email)",
        );
      }

      const fields = fieldsParam
        .split(",")
        .map((field) => field.trim())
        .filter((field) => field.length > 0) as SelectableUserField[];

      if (fields.length === 0) {
        throw new BadRequest("At least one field must be specified");
      }

      const users: PartialUserResponseDto[] =
        await this.service.getAllWithFields(fields);

      res.json(users);
    } catch (err) {
      next(err);
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
      const user: UserResponseDto = await this.service.getById(req.params.id);
      res.status(201).json({
        message: "User retrieved successfully",
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /users/:id/fields?fields=id,username,email
   * Récupère un utilisateur avec seulement les champs spécifiés
   */
  async getByIdWithFields(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id: string = req.params.id;

      if (!id) {
        throw new BadRequest("Id is required");
      }

      const fieldsParam = req.query.fields as string;

      if (!fieldsParam) {
        throw new BadRequest(
          "Fields query parameter is required (e.g., ?fields=id,username,email)",
        );
      }

      const fields = fieldsParam
        .split(",")
        .map((field) => field.trim())
        .filter((field) => field.length > 0) as SelectableUserField[];

      if (fields.length === 0) {
        throw new BadRequest("At least one field must be specified");
      }

      const user: PartialUserResponseDto = await this.service.getByIdWithFields(
        id,
        fields,
      );

      res.status(200).json({
        message: "User field retrieved successfully",
        user,
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

      const updateData: UserUpdateDto = {};

      if (req.body.email !== undefined) {
        updateData.email = req.body.email;
      }

      if (req.body.username !== undefined) {
        updateData.username = req.body.username;
      }

      if (req.body.password !== undefined) {
        updateData.password = req.body.password;
      }

      if (req.body.phone_number !== undefined) {
        updateData.phone_number = req.body.phone_number;
      }

      if (req.body.biography !== undefined) {
        updateData.biography = req.body.biography;
      }

      if (req.body.favorite_band !== undefined) {
        updateData.favorite_band = req.body.favorite_band;
      }

      if (req.body.has_notifications !== undefined) {
        updateData.has_notifications = req.body.has_notifications;
      }

      if (req.body.profile_picture !== undefined) {
        updateData.profile_picture = req.body.profile_picture;
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequest("No fields provided");
      }

      const user: UserResponseDto = await this.service.update(id, updateData);

      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.params.id) {
        throw new BadRequest("Id is required");
      }

      const user: UserResponseDeleteDto = await this.service.delete(
        req.params.id,
      );

      res.status(201).json({
        message: "User deleted successfully",
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await this.service.getProfile(id);

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new Unauthorized("User not authenticated");
      }

      const updateData: UserUpdateDto = {
        favorite_band: req.body.favorite_band,
        username: req.body.username,
        biography: req.body.biography,
        profile_picture: req.body.profile_picture,
      };

      const user = await this.service.updateProfile(userId, updateData);

      res.status(200).json({
        message: "Profile updated successfully",
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePushToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id, token } = req.body;
      // Optionnel : vérifier que l'id du token correspond à req.user.id pour la sécurité
      await userService.updatePushToken(user_id, token);
      res.status(200).json({ message: "Push token updated successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
