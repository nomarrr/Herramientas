import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrainstormService, BrainstormIdea } from '../services/brainstorm.service';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-brainstorm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brainstorm.component.html',
  styleUrl: './brainstorm.component.css'
})
export class BrainstormComponent implements OnInit {
  @Input() titulo: string = 'Ideas del Proyecto';
  @Input() descripcion: string = 'Comparte tus ideas para este proyecto. Puedes agregar ideas.';
  @Input() minIdeas: number = 3;
  @Input() maxIdeas: number = 5;
  
  ProjectName: string = 'Proyecto';
  idProy: number = 0;
  idUsuario: number = 0;
  nombreUsuario: string = '';

  ideas: BrainstormIdea[] = [];
  newIdea: string = '';

  // Variables para edición
  editIndex: number | null = null;
  editValue: string = '';

  constructor(
    private brainstormService: BrainstormService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.usuarioService.getUsuario();
    if (!usuario) {
      this.router.navigate(['/info-usuario']);
      return;
    }

    this.idProy = usuario.proyectoId;
    this.idUsuario = usuario.usuarioId;
    this.nombreUsuario = usuario.nombre;
    this.cargarIdeas();
  }

  cargarIdeas() {
    console.log('Iniciando carga de ideas...');
    this.brainstormService.getIdeas(this.idProy, this.idUsuario).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        console.log('Ideas recibidas:', response.ideas);
        this.ideas = response.ideas.map(idea => ({
          id: idea.id,
          idProy: idea.idProy,
          idUsuario: idea.idUsuario,
          idea: idea.idea,
          fecha: idea.fecha,
          nombre: idea.nombre
        }));
        console.log('Ideas asignadas:', this.ideas);
      },
      error: (error) => {
        console.error('Error al cargar ideas:', error);
      }
    });
  }

  addIdea() {
    if (this.newIdea.trim() && this.ideas.length < this.maxIdeas) {
      // Validación de datos
      if (!this.idProy || !this.idUsuario || !this.nombreUsuario) {
        console.error('Datos de usuario incompletos:', {
          idProy: this.idProy,
          idUsuario: this.idUsuario,
          nombreUsuario: this.nombreUsuario
        });
        return;
      }

      const request = {
        IdProy: this.idProy,
        IdUsuario: this.idUsuario,
        Idea: this.newIdea.trim(),
        Nombre: this.nombreUsuario
      };

      console.log('=== Datos a enviar ===');
      console.log('Request:', request);

      this.brainstormService.agregarIdea(request).subscribe({
        next: (response) => {
          console.log('Idea agregada exitosamente:', response);
          this.newIdea = '';
          // Agregar la nueva idea directamente al array
          if (response && response.idea) {
            this.ideas.push({
              id: response.idea.id,
              idProy: response.idea.idProy,
              idUsuario: response.idea.idUsuario,
              idea: response.idea.idea,
              fecha: response.idea.fecha,
              nombre: response.idea.nombre
            });
          } else {
            // Si no recibimos la idea en la respuesta, recargamos todas las ideas
            this.cargarIdeas();
          }
        },
        error: (error) => {
          console.error('Error al agregar idea:', error);
          console.error('Detalles del error:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error
          });
        }
      });
    }
  }

  deleteIdea(index: number) {
    const idea = this.ideas[index];
    this.brainstormService.eliminarIdea(idea.id).subscribe({
      next: () => {
        this.ideas.splice(index, 1);
        if (this.editIndex === index) {
          this.cancelEdit();
        }
      },
      error: (error) => {
        console.error('Error al eliminar idea:', error);
      }
    });
  }

  startEdit(index: number) {
    this.editIndex = index;
    this.editValue = this.ideas[index].idea;
  }

  saveEdit(index: number) {
    if (this.editValue.trim()) {
      const idea = this.ideas[index];
      const request = {
        IdProy: idea.idProy,
        IdUsuario: idea.idUsuario,
        Idea: this.editValue.trim(),
        Nombre: idea.nombre
      };

      this.brainstormService.editarIdea(idea.id, request).subscribe({
        next: () => {
          this.ideas[index].idea = this.editValue.trim();
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error al editar idea:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.editIndex = null;
    this.editValue = '';
  }

  // Métodos para validación
  get puedeAgregarIdeas(): boolean {
    return this.ideas.length < this.maxIdeas;
  }

  get puedeEliminarIdeas(): boolean {
    return this.ideas.length > this.minIdeas;
  }

  get mensajeValidacion(): string {
    if (this.ideas.length >= this.maxIdeas) {
      return `Has alcanzado el máximo de ${this.maxIdeas} ideas.`;
    }
    if (this.ideas.length < this.minIdeas) {
      return `Necesitas al menos ${this.minIdeas} ideas.`;
    }
    return '';
  }
}
