export interface VotingItem {
  id: number;
  idCategoria: number;
  idProy: number;
  idUsuario: number;
}

export interface VotingRequest {
  IdCategoria: number;
  IdProy: number;
  IdUsuario: number;
}

export interface VotingResponse {
  items: VotingItem[];
} 