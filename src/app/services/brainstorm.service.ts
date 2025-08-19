import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface BrainstormIdea {
  id: number;
  idProy: number;
  idUsuario: number;
  idea: string;
  fecha?: Date;
  nombre: string;
}

export interface BrainstormRequest {
  IdProy: number;
  IdUsuario: number;
  Idea: string;
  Nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrainstormService {
  private apiUrl = 'http://localhost:5000/api/Brainstorm';

  constructor(private http: HttpClient) { }

  getIdeas(idProy: number, idUsuario: number): Observable<{ ideas: BrainstormIdea[] }> {
    console.log('=== Obteniendo ideas ===');
    console.log('URL:', `${this.apiUrl}/ideas/${idProy}/${idUsuario}`);
    return this.http.get<{ ideas: BrainstormIdea[] }>(`${this.apiUrl}/ideas/${idProy}/${idUsuario}`).pipe(
      tap({
        next: (response) => {
          console.log('=== Respuesta exitosa de getIdeas ===');
          console.log('Status:', 200);
          console.log('Body:', response);
        },
        error: (error: HttpErrorResponse) => {
          console.error('=== Error en getIdeas ===');
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('Error:', error.error);
          console.error('Headers:', error.headers);
          console.error('URL:', error.url);
          console.error('Mensaje completo:', error);
        }
      })
    );
  }

  getTodasLasIdeas(idProy: number): Observable<{ ideas: BrainstormIdea[] }> {
    console.log('=== Obteniendo todas las ideas del proyecto ===');
    console.log('URL:', `${this.apiUrl}/ideas/${idProy}`);
    return this.http.get<{ ideas: BrainstormIdea[] }>(`${this.apiUrl}/ideas/${idProy}`).pipe(
      tap({
        next: (response) => {
          console.log('=== Respuesta exitosa de getTodasLasIdeas ===');
          console.log('Status:', 200);
          console.log('Body:', response);
        },
        error: (error: HttpErrorResponse) => {
          console.error('=== Error en getTodasLasIdeas ===');
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('Error:', error.error);
        }
      })
    );
  }

  agregarIdea(request: BrainstormRequest): Observable<{ idea: BrainstormIdea }> {
    console.log('=== Detalles de la petición ===');
    console.log('URL:', `${this.apiUrl}/agregar`);
    console.log('Método:', 'POST');
    console.log('Headers:', {
      'Content-Type': 'application/json'
    });
    console.log('Body:', JSON.stringify(request, null, 2));
    
    return this.http.post<{ idea: BrainstormIdea }>(`${this.apiUrl}/agregar`, request).pipe(
      tap({
        next: (response) => {
          console.log('=== Respuesta exitosa ===');
          console.log('Status:', 200);
          console.log('Body:', response);
        },
        error: (error: HttpErrorResponse) => {
          console.error('=== Error en la petición ===');
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('Error:', error.error);
          console.error('Headers:', error.headers);
          console.error('URL:', error.url);
          console.error('Mensaje completo:', error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error procesado:', error.error);
        return throwError(() => error);
      })
    );
  }

  eliminarIdea(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

  editarIdea(id: number, request: BrainstormRequest): Observable<any> {
    console.log('=== Editando idea ===');
    console.log('URL:', `${this.apiUrl}/editar/${id}`);
    console.log('Request:', request);
    
    return this.http.put(`${this.apiUrl}/editar/${id}`, request).pipe(
      tap({
        next: (response) => {
          console.log('=== Respuesta exitosa de editarIdea ===');
          console.log('Status:', 200);
          console.log('Body:', response);
        },
        error: (error: HttpErrorResponse) => {
          console.error('=== Error en editarIdea ===');
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('Error:', error.error);
        }
      })
    );
  }
} 