import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommenterService } from '../services/commenter.service';
import { CategorizerService } from '../services/categorizer.service';
import { UsuarioService } from '../services/usuario.service';
import { Comentario, ComentarioResponse } from '../models/commenter.models';
import { Idea, Categoria } from '../models/categorizer.models';

@Component({
  selector: 'app-review-comments',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatExpansionModule
  ],
  templateUrl: './review-comments.component.html',
  styleUrls: ['./review-comments.component.css']
})
export class ReviewCommentsComponent implements OnInit {
  categorias: Categoria[] = [];
  ideas: { [key: number]: Idea[] } = {};
  comentarios: { [key: number]: Comentario[] } = {};
  idProy: number = 0;
  idUsuario: number = 0;
  nombreUsuario: string = '';
  todasLasIdeas: Idea[] = [];

  constructor(
    private commenterService: CommenterService,
    private categorizerService: CategorizerService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const usuario = this.usuarioService.getUsuario();
    if (usuario) {
      this.idProy = usuario.proyectoId;
      this.idUsuario = usuario.usuarioId;
      this.nombreUsuario = usuario.nombre;
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    console.log('=== Iniciando carga de datos ===');
    this.cargarTodasLasIdeas();
  }

  cargarTodasLasIdeas() {
    console.log('=== Cargando todas las ideas ===');
    this.categorizerService.cargarIdeas(this.idProy).subscribe({
      next: (ideas) => {
        console.log('Ideas cargadas:', ideas);
        this.todasLasIdeas = ideas;
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error al cargar todas las ideas:', error);
        this.snackBar.open('Error al cargar las ideas', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  cargarCategorias(): void {
    console.log('=== Cargando categorías ===');
    this.categorizerService.cargarCategorias(this.idProy).subscribe({
      next: (response) => {
        console.log('Respuesta de categorías:', response);
        if (response && Array.isArray(response.items)) {
          this.categorias = response.items.map(item => ({
            id: item.id,
            nombre: item.categoria || '',
            comentarios: item.comentarios || '',
            listaIdeas: item.listaIdeas,
            idProy: item.idProy,
            backendId: item.id,
            ideas: []
          }));

          // Procesar ideas por categoría
          this.ideas = {};
          this.categorias.forEach(categoria => {
            this.ideas[categoria.id] = [];
            if (categoria.listaIdeas) {
              const ideaIds = categoria.listaIdeas.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
              this.ideas[categoria.id] = ideaIds.map(id => {
                const idea = this.todasLasIdeas.find(i => i.id === id);
                return idea ? { ...idea, categoria: categoria.nombre } : null;
              }).filter(idea => idea !== null) as Idea[];
            }
          });

          // Después de cargar las categorías, cargar los comentarios
          this.cargarComentarios();
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  cargarComentarios(): void {
    this.commenterService.cargarComentariosPorProyecto(this.idProy).subscribe({
      next: (response: ComentarioResponse) => {
        if (response && response.comments) {
          // Agrupar comentarios por categoría
          this.categorias.forEach(categoria => {
            this.comentarios[categoria.id] = response.comments.filter(
              comentario => comentario.idCategoria === categoria.id
            );
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
      }
    });
  }

  eliminarComentario(comentario: Comentario): void {
    this.commenterService.eliminarComentario(comentario.id).subscribe({
      next: () => {
        // Actualizar la lista de comentarios
        this.comentarios[comentario.idCategoria] = this.comentarios[comentario.idCategoria].filter(
          c => c.id !== comentario.id
        );
        this.snackBar.open('Comentario eliminado exitosamente', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error al eliminar comentario:', error);
        this.snackBar.open('Error al eliminar el comentario', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
} 