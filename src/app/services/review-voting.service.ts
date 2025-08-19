import { Injectable } from '@angular/core';
import { Observable, map, switchMap, of, forkJoin } from 'rxjs';
import { ReviewVotingResponse, ReviewVotingItem, Votante } from '../models/review-voting.models';
import { VotingService } from './voting.service';
import { CategorizerService } from './categorizer.service';
import { VotingItem } from '../models/voting.models';
import { Categoria } from '../models/categorizer.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewVotingService {
  constructor(
    private votingService: VotingService,
    private categorizerService: CategorizerService
  ) {}

  cargarResultadosVotacion(idProyecto: number): Observable<ReviewVotingResponse> {
    return this.categorizerService.cargarCategorias(idProyecto).pipe(
      switchMap(categoriasResponse => {
        if (categoriasResponse && Array.isArray(categoriasResponse.items)) {
          return this.votingService.cargarVotosPorProyecto(idProyecto).pipe(
            map(votosResponse => {
              const response: ReviewVotingResponse = { items: [] };
              const votos = votosResponse.items;
              const uniqueVoterIds = new Set(votos.map(voto => voto.idUsuario));
              const totalVoters = uniqueVoterIds.size;

              categoriasResponse.items.forEach(categoria => {
                const votosCategoria = votos.filter(v => v.idCategoria === categoria.id);
                const votantes: Votante[] = votosCategoria.map(voto => ({
                  idUsuario: voto.idUsuario,
                  nombreUsuario: `Usuario ${voto.idUsuario}`, // Aquí podrías obtener el nombre real del usuario
                  fechaVoto: new Date() // Aquí podrías obtener la fecha real del voto
                }));

                const porcentajeVotos = totalVoters > 0 
                  ? (votosCategoria.length / totalVoters) * 100 
                  : 0;

                response.items.push({
                  id: categoria.id,
                  idCategoria: categoria.id,
                  nombreCategoria: categoria.categoria || '',
                  votosTotales: votosCategoria.length,
                  porcentajeVotos: porcentajeVotos,
                  cumpleUmbral: porcentajeVotos >= 60,
                  votantes: votantes
                });
              });
              return response;
            })
          );
        }
        return of({ items: [] });
      })
    );
  }

  iniciarSegundaRonda(idProyecto: number): Observable<any> {
    // Primero obtenemos todos los votos del proyecto
    return this.votingService.cargarVotosPorProyecto(idProyecto).pipe(
      switchMap(votosResponse => {
        if (votosResponse.items.length === 0) {
          return of({ message: 'No hay votos para eliminar' });
        }

        // Creamos un array de observables para eliminar cada voto
        const deleteOperations = votosResponse.items.map(voto => 
          this.votingService.eliminarVoto(voto.id)
        );

        // Ejecutamos todas las operaciones de eliminación en paralelo
        return forkJoin(deleteOperations).pipe(
          map(() => ({ 
            message: 'Segunda ronda iniciada exitosamente',
            votosEliminados: votosResponse.items.length
          }))
        );
      })
    );
  }

  finalizarVotacion(idProyecto: number): Observable<any> {
    // Aquí podrías implementar la lógica para finalizar la votación
    // Por ejemplo, marcando las categorías seleccionadas como finalizadas
    return of({ message: 'Votación finalizada' });
  }
} 