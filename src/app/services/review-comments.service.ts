import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewComment, ReviewCommentRequest, ReviewCommentResponse } from '../models/review-comments.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewCommentsService {
  private apiUrl = 'http://localhost:5000/api/ReviewComments';

  constructor(private http: HttpClient) {}

  cargarComentarios(idProyecto: number): Observable<ReviewCommentResponse> {
    return this.http.get<ReviewCommentResponse>(`${this.apiUrl}/byproy/${idProyecto}`);
  }

  actualizarEstado(idComentario: number, estado: string): Observable<any> {
    const request: ReviewCommentRequest = {
      IdCategoria: 0, // No se usa en esta operación
      Comentarios: '', // No se usa en esta operación
      Estado: estado
    };
    return this.http.put(`${this.apiUrl}/${idComentario}/estado`, request);
  }

  agregarNota(idComentario: number, nota: string): Observable<any> {
    const request: ReviewCommentRequest = {
      IdCategoria: 0, // No se usa en esta operación
      Comentarios: nota,
      Estado: '' // No se usa en esta operación
    };
    return this.http.put(`${this.apiUrl}/${idComentario}/nota`, request);
  }
} 