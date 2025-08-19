export interface ReviewComment {
  id: number;
  idCategoria: number;
  comentarios: string;
  autor: string;
  fecha: Date;
  estado: 'pendiente' | 'revisado' | 'implementado';
}

export interface ReviewCommentRequest {
  IdCategoria: number;
  Comentarios: string;
  Estado: string;
}

export interface ReviewCommentResponse {
  items: ReviewComment[];
} 