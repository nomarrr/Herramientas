export interface Comentario {
  id: number;
  idCategoria: number;
  comentarios: string;
  idProy: number;
  idUsuario: number;
}

export interface ComentarioRequest {
  IdCategoria: number;
  Comentarios: string;
  IdProy: number;
  IdUsuario: number;
}

export interface ComentarioResponse {
  comments: Comentario[];
}

export interface Categoria {
  id: number;
  nombre: string;
  comentarios?: string;
} 