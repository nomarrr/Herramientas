import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CategorizerService } from '../services/categorizer.service';
import { UsuarioService } from '../services/usuario.service';
import { VotingService } from '../services/voting.service';
import { Categoria, Idea } from '../models/categorizer.models';
import { VotingItem } from '../models/voting.models';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css'],
})
export class VotingComponent implements OnInit {
  categorias: Categoria[] = [];
  todosLosVotos: VotingItem[] = [];
  votosUsuario: VotingItem[] = [];
  idProy: number = 0;
  idUsuario: number = 0;
  nombreUsuario: string = '';
  // totalUsuariosDecisores ya no se usa directamente para el porcentaje
  // El porcentaje ahora se calcula sobre el número de usuarios únicos que han votado.
  // Si necesitas este valor para otro propósito, mantenlo y cárgalo.
  totalUsuariosDecisores: number = 0; // Inicializar a 0 o cargar si se usa para algo más
  
  @Input() maxVotesPerUser: number = 2; // <<< Ahora es un Input

  porcentajesVoto: { [key: number]: number } = {};

  constructor(
    private categorizerService: CategorizerService,
    private usuarioService: UsuarioService,
    private votingService: VotingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const usuario = this.usuarioService.getUsuario();
    if (usuario) {
      this.idProy = usuario.proyectoId;
      this.idUsuario = usuario.usuarioId;
      this.nombreUsuario = usuario.nombre;
      // TODO: Cargar totalUsuariosDecisores si se usa para algo más
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.cargarCategorias();
    this.cargarTodosLosVotos();
  }

  cargarCategorias() {
    this.categorizerService.cargarCategorias(this.idProy).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.items)) {
          this.categorias = response.items.map((item) => ({
            id: item.id,
            nombre: item.categoria || '',
            ideas: [],
            backendId: item.id,
            comentarios: item.comentarios,
            idProy: item.idProy,
            listaIdeas: item.listaIdeas
          }));
          if (this.todosLosVotos.length > 0) {
            this.calcularTodosLosPorcentajes();
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  cargarTodosLosVotos() {
    this.votingService.cargarVotosPorProyecto(this.idProy).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.items)) {
          this.todosLosVotos = response.items;
          this.filtrarVotosUsuario();
          this.calcularTodosLosPorcentajes();
        }
      },
      error: (error) => {
        console.error('Error al cargar votos:', error);
        this.snackBar.open('Error al cargar los votos', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  filtrarVotosUsuario() {
    this.votosUsuario = this.todosLosVotos.filter(
      (voto) => voto.idUsuario === this.idUsuario
    );
  }

  calcularTodosLosPorcentajes() {
    const porcentajes: { [key: number]: number } = {};
    // Calcular el número de usuarios únicos que han votado
    const uniqueVoterIds = new Set(this.todosLosVotos.map(voto => voto.idUsuario));
    const totalVoters = uniqueVoterIds.size;

    this.categorias.forEach((categoria) => {
      porcentajes[categoria.id] = this.votingService.calcularPorcentajeVotos(
        categoria.id,
        this.todosLosVotos,
        totalVoters // Usar el número de votantes únicos
      );
    });
    this.porcentajesVoto = porcentajes;
    // Actualizar totalUsuariosDecisores si quieres mostrar este número
    this.totalUsuariosDecisores = totalVoters;
  }

  emitirVoto(idCategoria: number) {
    // Verificar si el usuario ha alcanzado el límite de votos usando el Input property
    if (this.votosUsuario.length >= this.maxVotesPerUser) {
      this.snackBar.open(`Ya has alcanzado el límite de ${this.maxVotesPerUser} votos.`, 'Cerrar', { duration: 3000 });
      return; // Salir si se alcanzó el límite
    }

    const request = {
      IdCategoria: idCategoria,
      IdProy: this.idProy,
      IdUsuario: this.idUsuario,
    };

    this.votingService.emitirVoto(request).subscribe({
      next: (response) => {
        console.log('Voto emitido', response);
        this.cargarTodosLosVotos(); // Recargar votos para actualizar la vista
        this.snackBar.open('Voto registrado exitosamente', 'Cerrar', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Error al emitir voto:', error);
        if (
          error.status === 400 &&
          error.error &&
          error.error.error &&
          error.error.error.includes('Ya votó por esta categoría')
        ) {
          this.snackBar.open('Ya has votado por esta categoría', 'Cerrar', {
            duration: 3000,
          });
        } else {
          this.snackBar.open('Error al registrar el voto', 'Cerrar', {
            duration: 3000,
          });
        }
      },
    });
  }

  eliminarVoto(idCategoria: number) {
    const votoUsuario = this.votosUsuario.find(
      (voto) => voto.idCategoria === idCategoria
    );
    if (votoUsuario) {
      this.votingService.eliminarVoto(votoUsuario.id).subscribe({
        next: (response) => {
          console.log('Voto eliminado', response);
          this.cargarTodosLosVotos(); // Recargar votos para actualizar la vista
          this.snackBar.open('Voto eliminado exitosamente', 'Cerrar', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error al eliminar voto:', error);
          this.snackBar.open('Error al eliminar el voto', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    }
  }

  haVotado(idCategoria: number): boolean {
    return this.votingService.haVotado(idCategoria, this.votosUsuario);
  }

  getVotoUsuarioId(idCategoria: number): number | undefined {
    return this.votingService.getVotoUsuarioId(idCategoria, this.votosUsuario);
  }

  getCategoriaVoteCount(idCategoria: number): number {
    return this.todosLosVotos.filter(
      (voto) => voto.idCategoria === idCategoria
    ).length;
  }

  getCategoriaVotePercentage(idCategoria: number): number {
    return this.porcentajesVoto[idCategoria] || 0;
  }

  cumpleUmbral(idCategoria: number): boolean {
    return this.getCategoriaVotePercentage(idCategoria) >= 60;
  }

   // Método para verificar si el botón de votar debe estar deshabilitado
   isVoteButtonDisabled(idCategoria: number): boolean {
      return this.haVotado(idCategoria) || this.votosUsuario.length >= this.maxVotesPerUser;
   }

   // Método para verificar si el botón de quitar voto debe estar deshabilitado
   isRemoveVoteButtonDisabled(idCategoria: number): boolean {
       return !this.haVotado(idCategoria);
   }
} 