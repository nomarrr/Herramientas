export interface ReviewVotingResponse {
  items: ReviewVotingItem[];
}

export interface ReviewVotingItem {
  id: number;
  idCategoria: number;
  nombreCategoria: string;
  votosTotales: number;
  porcentajeVotos: number;
  cumpleUmbral: boolean;
  votantes: Votante[];
}

export interface Votante {
  idUsuario: number;
  nombreUsuario: string;
  fechaVoto: Date;
}

export interface ReviewVotingRequest {
  idProyecto: number;
  iniciarSegundaRonda: boolean;
} 