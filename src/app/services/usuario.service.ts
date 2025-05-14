import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Usuario {
  proyectoId: number;
  usuarioId: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private usuarioInfo = new BehaviorSubject<Usuario | null>(null);
  usuarioInfo$ = this.usuarioInfo.asObservable();

  setUsuario(usuario: Usuario) {
    this.usuarioInfo.next(usuario);
  }

  getUsuario() {
    return this.usuarioInfo.value;
  }
} 