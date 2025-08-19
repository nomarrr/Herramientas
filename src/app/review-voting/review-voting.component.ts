import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UsuarioService } from '../services/usuario.service';
import { ReviewVotingService } from '../services/review-voting.service';
import { ReviewVotingItem } from '../models/review-voting.models';

@Component({
  selector: 'app-review-voting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  templateUrl: './review-voting.component.html',
  styleUrls: ['./review-voting.component.css']
})
export class ReviewVotingComponent implements OnInit {
  resultadosVotacion: ReviewVotingItem[] = [];
  idProy: number = 0;
  idUsuario: number = 0;
  nombreUsuario: string = '';
  cargando: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private reviewVotingService: ReviewVotingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const usuario = this.usuarioService.getUsuario();
    if (usuario) {
      this.idProy = usuario.proyectoId;
      this.idUsuario = usuario.usuarioId;
      this.nombreUsuario = usuario.nombre;
      this.cargarResultadosVotacion();
    }
  }

  cargarResultadosVotacion() {
    this.cargando = true;
    this.reviewVotingService.cargarResultadosVotacion(this.idProy).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.items)) {
          this.resultadosVotacion = response.items;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar resultados de votación:', error);
        this.snackBar.open('Error al cargar los resultados de votación', 'Cerrar', {
          duration: 3000
        });
        this.cargando = false;
      }
    });
  }

  iniciarSegundaRonda() {
    if (confirm('¿Estás seguro de iniciar una segunda ronda de votación? Se eliminarán todos los votos existentes.')) {
      this.cargando = true;
      this.reviewVotingService.iniciarSegundaRonda(this.idProy).subscribe({
        next: (response) => {
          this.snackBar.open(
            response.votosEliminados > 0 
              ? `Segunda ronda iniciada. Se eliminaron ${response.votosEliminados} votos.` 
              : 'No había votos para eliminar.',
            'Cerrar',
            { duration: 5000 }
          );
          this.cargarResultadosVotacion();
        },
        error: (error) => {
          console.error('Error al iniciar segunda ronda:', error);
          this.snackBar.open('Error al iniciar la segunda ronda', 'Cerrar', {
            duration: 3000
          });
          this.cargando = false;
        }
      });
    }
  }

  finalizarVotacion() {
    if (confirm('¿Estás seguro de finalizar la votación? Las categorías seleccionadas serán las que cumplan con el umbral del 60%.')) {
      this.reviewVotingService.finalizarVotacion(this.idProy).subscribe({
        next: () => {
          this.snackBar.open('Votación finalizada exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.cargarResultadosVotacion();
        },
        error: (error) => {
          console.error('Error al finalizar votación:', error);
          this.snackBar.open('Error al finalizar la votación', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  getCategoriasSeleccionadas(): ReviewVotingItem[] {
    return this.resultadosVotacion.filter(item => item.cumpleUmbral);
  }

  getCategoriasNoSeleccionadas(): ReviewVotingItem[] {
    return this.resultadosVotacion.filter(item => !item.cumpleUmbral);
  }
} 