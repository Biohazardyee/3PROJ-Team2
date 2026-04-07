import { MediaStatus } from "../../generated/prisma/enums";
import { MediaResponseDto } from "./media.dto"; // Importe ton DTO de média

export interface MediaStatusResponseDto {
  user_id: string;
  media_id: string;
  status: MediaStatus;
  created_at: Date;
  media?: MediaResponseDto; 
}

// Post Interface
export interface MediaStatusCreateDto {
  user_id: string;
  media_id: string;
  status: MediaStatus;
}

export interface MediaStatusUpdateDto {
  status?: MediaStatus;
}
