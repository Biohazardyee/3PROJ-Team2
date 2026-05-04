export interface MessageResponseDto {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: Date;
}

export interface MessageAddResponseDto {
    conversation_id: string,
    sender_id: string,
    content: string,
    is_read: boolean,
    created_at: Date
}

export interface MessageDeleteResponseDto {
    conversation_id: string,
}

export interface MessageAddDto {
    conversation_id: string,
    sender_id: string,
    content: string,
}

export interface MessageUpdateDto {
    content?: string,
    is_read?: boolean,
}