import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../services/usuario.service';

@Component({
  selector: 'app-info-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './info-usuario.component.html',
  styleUrl: './info-usuario.component.css'
})
export class InfoUsuarioComponent {
  usuario: Usuario = {
    proyectoId: 0,
    usuarioId: 0,
    nombre: ''
  };

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  onSubmit() {
    this.usuarioService.setUsuario(this.usuario);
    this.router.navigate(['/menu']);
  }
}
