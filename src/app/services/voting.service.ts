import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VotingResponse, VotingRequest, VotingItem } from '../models/voting.models';

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  private apiUrl = 'http://localhost:5000/api/Voting';

  constructor(private http: HttpClient) {}

  cargarVotosPorProyecto(idProyecto: number): Observable<VotingResponse> {
    // Asumiendo que el endpoint GetAllItems puede filtrar por proyecto si es necesario
    // O que tienes otro endpoint específico para obtener votos por proyecto
    // Si GetAllItems trae todos los votos y necesitas filtrar en frontend, ajustaremos después.
    // Por ahora, usaremos GetAllItems asumiendo que puede traer votos por proyecto si se implementa así en backend.
    // Si no, necesitaríamos un endpoint como /api/Voting/byproy/{idProy}
    // Basado en tus endpoints, parece que el endpoint GET /api/Voting/byproy/{idProy} sería ideal.
    // Como no está en tu lista, ajustaré para usar GetAllItems y filtrar en frontend si es necesario.
    // *Corrección*: Tienes un endpoint GET /api/Categorizer/byproy/{idProy}. Es probable que necesites uno similar para Voting.
    // Dado que no lo tengo, usaré un nombre hipotético `byproy` y asumiré que existe o necesitará ser creado en el backend.
    // Si solo GetAllItems está disponible, lo usaremos y filtraremos aquí si la respuesta contiene todos los proyectos.

    // === Opción 1: Usando endpoint hipotético por proyecto ===
    // return this.http.get<VotingResponse>(`${this.apiUrl}/byproy/${idProyecto}`);

    // === Opción 2: Usando GetAllItems y asumiendo que trae todo para filtrar aquí ===
    // return this.http.get<VotingResponse>(`${this.apiUrl}`); // Si este trae todo, necesitaríamos filtrar

    // === Opción 3: Usando la información del endpoint para obtener todos los votos (GET /api/Voting) ===
    // Tu endpoint GET /api/Voting no filtra por proyecto. Necesitaremos un endpoint de backend que sí lo haga.
    // Dado que la descripción implica trabajar con categorías de un proyecto específico, es crucial obtener los votos solo para ese proyecto.
    // Solicitaré al usuario si existe un endpoint para obtener votos por proyecto, o si debo asumir que GetAllItems lo permite.

    // *Acción a tomar*: Implementaré `cargarVotosPorProyecto` asumiendo un endpoint `/byproy/{idProyecto}` basado en la necesidad del flujo.
    // Si este endpoint no existe, el usuario deberá implementarlo en el backend o clarificar cómo obtener los votos por proyecto.

    return this.http.get<VotingResponse>(`${this.apiUrl}/byproy/${idProyecto}`);
  }

  emitirVoto(request: VotingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  eliminarVoto(idVoto: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idVoto}`);
  }

  // Método para calcular el porcentaje de votos por categoría (lógica de frontend)
  calcularPorcentajeVotos(
    idCategoria: number,
    todosLosVotos: VotingItem[],
    totalUsuariosDecisores: number
  ): number {
    if (totalUsuariosDecisores === 0) {
      return 0;
    }
    const votosCategoria = todosLosVotos.filter(
      (voto) => voto.idCategoria === idCategoria
    ).length;
    return (votosCategoria / totalUsuariosDecisores) * 100;
  }

   // Método para verificar si el usuario actual ya votó por una categoría
  haVotado(idCategoria: number, votosUsuario: VotingItem[]): boolean {
    return votosUsuario.some(voto => voto.idCategoria === idCategoria);
  }

   // Método para obtener el ID del voto del usuario para una categoría específica
   getVotoUsuarioId(idCategoria: number, votosUsuario: VotingItem[]): number | undefined {
     const voto = votosUsuario.find(voto => voto.idCategoria === idCategoria);
     return voto ? voto.id : undefined;
   }
} 