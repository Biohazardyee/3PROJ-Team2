// Response Interface
export interface MediaResponseDto {
  id: string;
  api_id: string;
  name: string;
  artist: string;
  cover: string | null; 
  rating?: number;
  created_at: Date;
}


export interface MediaCreateDto {
  api_id: string;
  content: {
    name: string;
    artist: string;
    cover?: string | null;
    mbid?: string | null;
  };
}

export interface MediaUpdateDto {
  api_id?: string;
}
