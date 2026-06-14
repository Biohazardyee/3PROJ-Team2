import { Messages } from "../../generated/prisma/browser.js";

export interface ConversationResponseDto {
  id: string;
  user1_id: string;
  user2_id: string;
  messages: Messages[];
  created_at: Date;
}

export interface ConversationUserDto {
  id: string;
  username: string;
  profile_picture: string | null;
  role: string;
}

export interface UserConversationResponseDto {
  id: string;
  user1: ConversationUserDto;
  user2: ConversationUserDto;
  messages: {
    content: string;
    created_at: Date;
  }[];
  _count: {
    messages: number;
  };
}

export interface ConversationAddDto {
  user1_id: string;
  user2_id: string;
}

export interface ConversationAddResponseDto {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: Date;
}

export interface ConversationResponseDeleteDto {
  id: string;
}
