import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comentario, ComentarioRequest, ComentarioResponse } from '../models/commenter.models';
import { Idea } from '../models/categorizer.models';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommenterService {
  private apiUrl = 'http://localhost:5000/api/Commenter';

  constructor(private http: HttpClient) { }

  cargarTodosLosComentarios(): Observable<ComentarioResponse> {
    return this.http.get<ComentarioResponse>(`${this.apiUrl}`);
  }

  cargarComentarioPorId(id: number): Observable<Comentario> {
    return this.http.get<Comentario>(`${this.apiUrl}/${id}`);
  }

  cargarComentariosPorProyecto(idProy: number): Observable<ComentarioResponse> {
    console.log('=== CommenterService: cargarComentariosPorProyecto ===');
    console.log('URL:', `${this.apiUrl}/categoriesbyproy/${idProy}`);
    return this.http.get<any>(`${this.apiUrl}/categoriesbyproy/${idProy}`).pipe(
      tap({
        next: (response) => {
          console.log('Respuesta raw del backend:', response);
        },
        error: (error) => {
          console.error('Error en cargarComentariosPorProyecto:', error);
        }
      }),
      map(response => {
        // Si la respuesta es null o undefined
        if (!response) {
          console.warn('La respuesta es null o undefined');
          return { comments: [] };
        }

        // Si la respuesta ya tiene el formato correcto
        if (response.comments && Array.isArray(response.comments)) {
          console.log('Respuesta con formato correcto:', response);
          return response;
        }

        // Si la respuesta es un array directo
        if (Array.isArray(response)) {
          console.log('Respuesta es un array, convirtiendo a formato correcto');
          return { comments: response };
        }

        // Si la respuesta tiene otro formato
        console.warn('Formato de respuesta no reconocido:', response);
        return { comments: [] };
      })
    );
  }

  cargarComentariosPorCategoria(idCategoria: number): Observable<ComentarioResponse> {
    return this.http.get<ComentarioResponse>(`${this.apiUrl}/bycategoria/${idCategoria}`);
  }

  agregarComentario(request: ComentarioRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  eliminarComentario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  editarComentario(id: number, request: ComentarioRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  cargarIdeasPorCategoria(idCategoria: number): Observable<Idea[]> {
    return this.http.get<Idea[]>(`${this.apiUrl}/ideas/${idCategoria}`);
  }
} 