import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrainstormService } from '../services/brainstorm.service';
import { UsuarioService } from '../services/usuario.service';
import { CategorizerService } from '../services/categorizer.service';
import { Idea, Categoria } from '../models/categorizer.models';

@Component({
  selector: 'app-categorizer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './categorizer.component.html',
  styleUrls: ['./categorizer.component.css']
})
export class CategorizerComponent implements OnInit {
  ideas: Idea[] = [];
  categorias: Categoria[] = [];
  nuevaCategoria: string = '';
  idProy: number = 0;
  idUsuario: number = 0;
  allDropListIds: string[] = [];

  constructor(
    private brainstormService: BrainstormService,
    private categorizerService: CategorizerService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('=== Iniciando CategorizerComponent ===');
    const usuario = this.usuarioService.getUsuario();
    console.log('Usuario obtenido:', usuario);
    if (usuario) {
      this.idProy = usuario.proyectoId;
      this.idUsuario = usuario.usuarioId;
      console.log('IDs configurados:', { idProy: this.idProy, idUsuario: this.idUsuario });
      this.cargarDatos();
    } else {
      console.error('No se pudo obtener el usuario');
    }
  }

  cargarDatos() {
    console.log('=== Iniciando carga de datos ===');
    this.cargarIdeas();
  }

  cargarIdeas() {
    console.log('=== Iniciando carga de ideas ===');
    console.log('idProy para cargar ideas:', this.idProy);
    this.categorizerService.cargarIdeas(this.idProy).subscribe({
      next: (ideas) => {
        console.log('=== Ideas cargadas exitosamente ===', ideas);
        this.ideas = ideas;
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error al cargar ideas:', error);
        this.snackBar.open('Error al cargar las ideas', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  cargarCategorias() {
    console.log('=== Iniciando carga de categorías ===');
    console.log('idProy para cargar categorías:', this.idProy);
    console.log('Ideas disponibles antes de cargar categorías:', this.ideas);
    
    this.categorizerService.cargarCategorias(this.idProy).subscribe({
      next: (response) => {
        console.log('=== Respuesta completa de cargarCategorias ===', response);
        const nuevasCategorias: Categoria[] = [];
        const ideasEnCategorias = new Set<number>();
        
        if (!response) {
          console.error('La respuesta de categorías es null o undefined');
          return;
        }

        if (!Array.isArray(response.items)) {
          console.error('response.items no es un array:', response.items);
          return;
        }

        console.log('Número de categorías recibidas:', response.items.length);

        if (response && Array.isArray(response.items)) {
          for (const item of response.items) {
            if (item && typeof item === 'object' && typeof item.id === 'number') {
              const ideas: Idea[] = [];
              if (item.listaIdeas) {
                const ids = item.listaIdeas.split(',').filter(id => id.trim() !== '');
                for (const id of ids) {
                  const parsedId = parseInt(id.trim(), 10);
                  if (!isNaN(parsedId)) {
                    const idea = this.ideas.find(i => i.id === parsedId);
                    if (idea) {
                      ideas.push({
                        ...idea,
                        categoria: item.categoria || undefined
                      });
                      ideasEnCategorias.add(parsedId);
                    } else {
                      console.warn(`Idea con ID ${parsedId} no encontrada en la lista de ideas disponibles.`);
                    }
                  }
                }
              }

              nuevasCategorias.push({
                id: item.id,
                nombre: item.categoria || '',
                ideas: ideas,
                backendId: item.id,
                comentarios: item.comentarios,
                idProy: item.idProy,
                listaIdeas: item.listaIdeas
              });
            } else {
              const itemIdForLog = item && typeof item.id === 'number' ? item.id : 'desconocido';
              console.warn(`Item de categoría inválido o incompleto recibido del backend (ID: ${itemIdForLog}):`, item);
            }
          }
        }

        this.ideas = this.ideas.filter(idea => !ideasEnCategorias.has(idea.id));
        
        console.log('=== Estado final ===');
        console.log('Ideas en categorías:', ideasEnCategorias);
        console.log('Ideas disponibles después de filtrar:', this.ideas);
        console.log('Categorías cargadas:', nuevasCategorias);

        this.categorias = nuevasCategorias;
        this.updateConnectedLists();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  crearCategoria() {
    if (!this.nuevaCategoria.trim()) {
      this.snackBar.open('Por favor ingrese un nombre para la categoría', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.categorizerService.crearCategoria(this.nuevaCategoria, this.idProy).subscribe({
      next: (response: any) => {
        const categoria: Categoria = {
          id: response.id,
          nombre: this.nuevaCategoria.trim(),
          ideas: [],
          backendId: response.id,
          comentarios: null,
          idProy: this.idProy,
          listaIdeas: null
        };
        this.categorias.push(categoria);
        this.nuevaCategoria = '';
        this.updateConnectedLists();
        this.cdr.detectChanges();
        this.snackBar.open('Categoría creada exitosamente', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
        this.snackBar.open('Error al crear la categoría', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  eliminarCategoria(categoriaId: number) {
    this.categorizerService.eliminarCategoria(categoriaId).subscribe({
      next: () => {
        const categoria = this.categorias.find(c => c.id === categoriaId);
        if (categoria) {
          this.ideas = [...this.ideas, ...categoria.ideas.map(idea => ({...idea, categoria: undefined}))];
          this.categorias = this.categorias.filter(c => c.id !== categoriaId);
          this.updateConnectedLists();
          this.cdr.detectChanges();
          this.snackBar.open('Categoría eliminada exitosamente', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        this.snackBar.open('Error al eliminar la categoría', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<Idea[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const idea = event.previousContainer.data[event.previousIndex];
      const previousContainerId = event.previousContainer.id;
      const targetContainerId = event.container.id;

      const targetCategoria = this.categorias.find(c => c.id.toString() === targetContainerId);
      const previousCategoria = this.categorias.find(c => c.id.toString() === previousContainerId);

      if (targetContainerId === 'ideasList') {
        idea.categoria = undefined;
        if (!this.ideas.some(i => i.id === idea.id)) {
          this.ideas.push({...idea, categoria: undefined});
        }
      } else if (targetCategoria) {
        if (!targetCategoria.ideas.some(i => i.id === idea.id)) {
          idea.categoria = targetCategoria.nombre;
          this.ideas = this.ideas.filter(i => i.id !== idea.id);
        }
      }

      if (previousCategoria) {
        previousCategoria.ideas = previousCategoria.ideas.filter(i => i.id !== idea.id);
        if (targetContainerId === 'ideasList') {
          this.ideas.push({...idea, categoria: undefined});
        }
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      if (previousCategoria) {
        this.categorizerService.actualizarCategoria(previousCategoria.id, previousCategoria, this.idProy).subscribe({
          next: () => console.log(`Idea ${idea.id} eliminada de la categoría ${previousCategoria.id} en backend.`),
          error: (error) => console.error(`Error al eliminar idea ${idea.id} de categoría ${previousCategoria.id} en backend:`, error)
        });
      }

      if (targetCategoria) {
        this.categorizerService.actualizarCategoria(targetCategoria.id, targetCategoria, this.idProy).subscribe({
          next: () => console.log(`Idea ${idea.id} agregada a la categoría ${targetCategoria.id} en backend.`),
          error: (error) => {
            console.error('Error al actualizar categoría en backend después del drop:', error);
            this.snackBar.open('Error al guardar el cambio de categoría', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    }

    this.updateConnectedLists();
    this.cdr.detectChanges();
  }

  getIdeasDisponibles(): Idea[] {
    return this.ideas.filter(idea => !idea.categoria);
  }

  updateConnectedLists() {
    const categoriaIds = this.categorias
      .filter(c => c && typeof c.id === 'number')
      .map(c => c.id.toString());
    this.allDropListIds = ['ideasList', ...categoriaIds];
  }
}
