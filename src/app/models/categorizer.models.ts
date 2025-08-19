export interface Idea {
  id: number;
  texto: string;
  autor: string;
  categoria?: string; // Nombre de la categoría a la que pertenece, si está categorizada
}

export interface Categoria {
  id: number; // ID interno generado en frontend
  nombre: string;
  ideas: Idea[]; // Lista de ideas asociadas en frontend
  backendId: number; // ID del backend (ya no opcional)
  comentarios: string | null; // Coincide con el tipo del backend
  idProy: number; // Coincide con el tipo del backend
  listaIdeas: string | null; // Coincide con el tipo del backend
}

// Nuevas interfaces para la API
export interface CategorizerItem {
  id: number; // ID de backend en minúscula
  categoria: string | null; // Nombre de categoría en minúscula
  listaIdeas: string | null; // Lista de IDs en minúscula (para la respuesta GET)
  comentarios: string | null; // Comentarios en minúscula
  idProy: number; // IdProy en minúscula
}

export interface CategorizerResponse {
  items: CategorizerItem[];
}

// Interfaz para enviar datos al backend (POST/PUT) - ¡DEFINITIVAMENTE ListaIdeas!
export interface CategorizerRequest {
  Categoria: string | null; // Propiedad esperada por el backend en mayúscula
  ListaIdeas: string | null; // <-- ¡Esta es la correcta para enviar!
  comentarios: string | null; // Propiedad esperada por el backend en mayúscula
  IdProy: number; // Propiedad esperada por el backend en mayúscula
}