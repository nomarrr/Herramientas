import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommenterService } from '../services/commenter.service';
import { CategorizerService } from '../services/categorizer.service';
import { UsuarioService } from '../services/usuario.service';
import { Comentario, ComentarioRequest } from '../models/commenter.models';
import { Idea, Categoria } from '../models/categorizer.models';

@Component({
  selector: 'app-commenter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDialogModule
  ],
  templateUrl: './commenter.component.html',
  styleUrls: ['./commenter.component.css']
})
export class CommenterComponent implements OnInit {
  categorias: Categoria[] = [];
  comentarios: { [key: number]: Comentario[] } = {};
  ideas: { [key: number]: Idea[] } = {};
  nuevoComentario: { [key: number]: string } = {};
  idProy: number = 0;
  idUsuario: number = 0;
  nombreUsuario: string = '';
  todasLasIdeas: Idea[] = [];

  constructor(
    private commenterService: CommenterService,
    private categorizerService: CategorizerService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const usuario = this.usuarioService.getUsuario();
    if (usuario) {
      this.idProy = usuario.proyectoId;
      this.idUsuario = usuario.usuarioId;
      this.nombreUsuario = usuario.nombre;
      this.cargarDatos();
    }
  }

  cargarDatos() {
    console.log('=== Iniciando carga de datos ===');
    this.cargarTodasLasIdeas();
    this.cargarComentariosPorProyecto();
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

  cargarCategorias() {
    this.categorizerService.cargarCategorias(this.idProy).subscribe({
      next: (response) => {
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

          this.ideas = {};
          this.categorias.forEach(categoria => {
            this.nuevoComentario[categoria.id] = '';
            this.ideas[categoria.id] = [];
            if (categoria.listaIdeas) {
              const ideaIds = categoria.listaIdeas.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id));
              ideaIds.forEach((ideaId: number) => {
                const idea = this.todasLasIdeas.find(i => i.id === ideaId);
                if (idea) {
                  this.ideas[categoria.id].push(idea);
                }
              });
            }
          });
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

  cargarComentariosPorProyecto() {
    console.log('=== Cargando comentarios por proyecto ===');
    console.log('idProy:', this.idProy);
    this.commenterService.cargarComentariosPorProyecto(this.idProy).subscribe({
      next: (response) => {
        console.log('Respuesta de comentarios:', response);
        if (response && Array.isArray(response.comments)) {
          // Agrupar comentarios por categoría
          this.comentarios = {};
          response.comments.forEach(comentario => {
            if (!this.comentarios[comentario.idCategoria]) {
              this.comentarios[comentario.idCategoria] = [];
            }
            this.comentarios[comentario.idCategoria].push(comentario);
          });
          console.log('Comentarios agrupados:', this.comentarios);
        } else {
          console.warn('La respuesta de comentarios no tiene el formato esperado:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
        this.snackBar.open('Error al cargar los comentarios', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  agregarComentario(idCategoria: number) {
    const texto = this.nuevoComentario[idCategoria]?.trim();
    if (!texto) {
      this.snackBar.open('Por favor ingrese un comentario', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (!this.idProy || !this.idUsuario) {
      this.snackBar.open('Error: No se encontró la información del usuario o proyecto', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const request: ComentarioRequest = {
      IdCategoria: idCategoria,
      Comentarios: texto,
      IdProy: this.idProy,
      IdUsuario: this.idUsuario
    };

    console.log('Enviando request:', request); // Para depuración

    this.commenterService.agregarComentario(request).subscribe({
      next: (response: any) => {
        if (!this.comentarios[idCategoria]) {
          this.comentarios[idCategoria] = [];
        }
        const nuevoComentario: Comentario = {
          id: response.id,
          idCategoria: idCategoria,
          comentarios: texto,
          idProy: this.idProy,
          idUsuario: this.idUsuario
        };
        this.comentarios[idCategoria].push(nuevoComentario);
        this.nuevoComentario[idCategoria] = '';
        this.snackBar.open('Comentario agregado exitosamente', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error al agregar comentario:', error);
        this.snackBar.open('Error al agregar el comentario', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  eliminarComentario(idCategoria: number, idComentario: number) {
    this.commenterService.eliminarComentario(idComentario).subscribe({
      next: () => {
        this.comentarios[idCategoria] = this.comentarios[idCategoria].filter(
          c => c.id !== idComentario
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

  editarComentario(idCategoria: number, comentario: Comentario) {
    const dialogRef = this.dialog.open(EditarComentarioDialog, {
      width: '500px',
      data: { comentario: comentario.comentarios }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const request: ComentarioRequest = {
          IdCategoria: idCategoria,
          Comentarios: result.trim(),
          IdProy: this.idProy,
          IdUsuario: this.idUsuario
        };

        this.commenterService.editarComentario(comentario.id, request).subscribe({
          next: () => {
            const index = this.comentarios[idCategoria].findIndex(c => c.id === comentario.id);
            if (index !== -1) {
              this.comentarios[idCategoria][index] = {
                ...comentario,
                comentarios: result.trim()
              };
            }
            this.snackBar.open('Comentario editado exitosamente', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error al editar comentario:', error);
            this.snackBar.open('Error al editar el comentario', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }
}

@Component({
  selector: 'editar-comentario-dialog',
  template: `
    <h2 mat-dialog-title>Editar Comentario</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="comentario-input">
        <mat-label>Comentario</mat-label>
        <textarea matInput
                  [(ngModel)]="data.comentario"
                  placeholder="Escriba su comentario aquí..."
                  rows="3">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!data.comentario.trim()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .comentario-input {
      width: 100%;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class EditarComentarioDialog {
  constructor(
    public dialogRef: MatDialogRef<EditarComentarioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { comentario: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.data.comentario);
  }
}