import {MessageAddResponseDto, MessageDeleteResponseDto, MessageResponseDto} from "../../types/messages/messages.dto";
import {BaseMapper} from "../base.mapper.js";
import {Messages} from "../../generated/prisma/browser.js";

class MessagesMapper extends BaseMapper<Messages, MessageResponseDto> {
    protected mapOne(message: Messages): MessageResponseDto {
        return {
            id: message.id,
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            content: message.content,
            is_read: message.is_read,
            created_at: message.created_at
        }
    }

    toAddDto(message: Messages): MessageAddResponseDto {
        return {
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            content: message.content,
            is_read: message.is_read,
        }
    }

    toDeleteDto(message: Messages): MessageDeleteResponseDto {
        return {
            conversation_id: message.conversation_id
        }
    }
}

export const messagesMapper = new MessagesMapper();