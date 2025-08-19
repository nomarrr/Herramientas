import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Idea, Categoria, CategorizerItem, CategorizerResponse, CategorizerRequest } from '../models/categorizer.models';
import { BrainstormService } from './brainstorm.service';

@Injectable({
  providedIn: 'root'
})
export class CategorizerService {
  private apiUrl = 'http://localhost:5000/api/Categorizer';
  private ideasSubject = new BehaviorSubject<Idea[]>([]);
  private categoriasSubject = new BehaviorSubject<Categoria[]>([]);

  ideas$ = this.ideasSubject.asObservable();
  categorias$ = this.categoriasSubject.asObservable();

  constructor(
    private http: HttpClient,
    private brainstormService: BrainstormService
  ) {}

  cargarIdeas(idProyecto: number): Observable<Idea[]> {
    return new Observable(observer => {
      this.brainstormService.getTodasLasIdeas(idProyecto).subscribe({
        next: (response) => {
          const ideas = response.ideas.map(idea => ({
            id: idea.id,
            texto: idea.idea,
            autor: idea.nombre,
            categoria: undefined
          }));
          this.ideasSubject.next(ideas);
          observer.next(ideas);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  cargarCategorias(idProyecto: number): Observable<CategorizerResponse> {
    console.log('=== Llamando a cargarCategorias ===');
    console.log('idProyecto:', idProyecto);
    console.log('URL:', `${this.apiUrl}/categoriesbyproy/${idProyecto}`);
    return this.http.get<any>(`${this.apiUrl}/categoriesbyproy/${idProyecto}`).pipe(
      tap({
        next: (response) => {
          console.log('=== Respuesta raw de cargarCategorias ===', response);
        },
        error: (error) => {
          console.error('=== Error en cargarCategorias ===', error);
        }
      }),
      map(response => {
        // Asegurarnos de que la respuesta tenga la estructura correcta
        if (!response) {
          return { items: [] };
        }
        
        // Si la respuesta es un array, convertirlo al formato esperado
        if (Array.isArray(response)) {
          return { items: response };
        }
        
        // Si la respuesta ya tiene la estructura correcta, devolverla
        if (response.items) {
          return response;
        }
        
        // Si no tiene ninguna de las estructuras anteriores, devolver un array vacío
        console.warn('La respuesta no tiene el formato esperado:', response);
        return { items: [] };
      })
    );
  }

  crearCategoria(nombre: string, idProyecto: number): Observable<any> {
    const request: CategorizerRequest = {
      Categoria: nombre.trim(),
      ListaIdeas: null,
      comentarios: null,
      IdProy: idProyecto
    };
    return this.http.post(`${this.apiUrl}`, request);
  }

  actualizarCategoria(id: number, categoria: Categoria, idProyecto: number): Observable<any> {
    const request: CategorizerRequest = {
      Categoria: categoria.nombre || null,
      ListaIdeas: categoria.ideas.map(idea => idea.id).join(',') || null,
      comentarios: categoria.comentarios || null,
      IdProy: idProyecto
    };

    console.log('=== Actualizando categoría ===');
    console.log('URL:', `${this.apiUrl}/${id}`);
    console.log('Método:', 'PUT');
    console.log('Body:', JSON.stringify(request, null, 2));
    
    return this.http.put(`${this.apiUrl}/${id}`, request).pipe(
      tap({
        next: (response) => {
          console.log('=== Actualización de categoría exitosa ===', response);
        },
        error: (error) => {
          console.error('=== Error al actualizar categoría ===', error);
          throw error;
        }
      })
    );
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  moverIdea(idea: Idea, categoriaDestino?: string): void {
    const ideasActuales = this.ideasSubject.value;
    const categoriasActuales = this.categoriasSubject.value;
    
    categoriasActuales.forEach(categoria => {
      categoria.ideas = categoria.ideas.filter(i => i.id !== idea.id);
    });

    if (categoriaDestino) {
      const categoriaDestinoObj = categoriasActuales.find(c => c.nombre === categoriaDestino);
      if (categoriaDestinoObj) {
        categoriaDestinoObj.ideas.push({...idea, categoria: categoriaDestino});
      }
    } else {
      this.ideasSubject.next([...ideasActuales, {...idea, categoria: undefined}]);
    }

    this.categoriasSubject.next(categoriasActuales);
  }

  getIdeasDisponibles(): Idea[] {
    return this.ideasSubject.value.filter(idea => !idea.categoria);
  }
} 