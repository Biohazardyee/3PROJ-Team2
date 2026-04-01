// Response Interface
export interface MediaResponseDto {
  id: string;
  api_id: string;
  rating?: number;
  created_at: Date;
}

// Post Interface
export interface MediaCreateDto {
  api_id: string;
}

export interface MediaUpdateDto {
  api_id?: string;
}
