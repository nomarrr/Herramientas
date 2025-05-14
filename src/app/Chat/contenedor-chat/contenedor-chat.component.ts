import { Component, OnInit, OnDestroy } from '@angular/core';
import { GrupoAComponent } from '../grupo-a/grupo-a.component';
import { GrupoBComponent } from '../grupo-b/grupo-b.component';
import { ChatService, Mensaje } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';

interface MensajeAgrupado {
  usuario: string;
  mensajes: string[];
  fecha: string;
}

@Component({
  selector: 'app-contenedor-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GrupoAComponent, 
    GrupoBComponent
  ],
  providers: [ChatService],
  templateUrl: './contenedor-chat.component.html',
  styleUrl: './contenedor-chat.component.css'
})
export class ContenedorChatComponent implements OnInit, OnDestroy {
  mensajesAgrupados: MensajeAgrupado[] = [];
  usuarioActual: string = '';
  mensajeNuevo: string = '';
  private subscription: Subscription;
  private proyectoId: number = 0;
  private usuarioId: number = 0;

  constructor(
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    const usuario = this.usuarioService.getUsuario();
    if (!usuario) {
      this.router.navigate(['/info-usuario']);
      return;
    }

    this.usuarioActual = usuario.nombre;
    this.proyectoId = usuario.proyectoId;
    this.usuarioId = usuario.usuarioId;

    console.log('Iniciando carga de mensajes...');
    this.cargarMensajes();
    this.escucharNuevosMensajes();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarMensajes() {
    console.log('Llamando al servicio de mensajes...');
    this.chatService.getMensajes(this.proyectoId)
      .subscribe({
        next: (response) => {
          console.log('Respuesta completa:', response);
          if (response && response.mensajes) {
            this.agruparMensajes(response.mensajes);
          }
        },
        error: (error) => {
          console.error('Error al cargar mensajes:', error);
        }
      });
  }

  async enviarMensaje() {
    if (!this.mensajeNuevo.trim()) return;

    try {
      await this.chatService.enviarMensaje(
        this.mensajeNuevo,
        this.usuarioActual,
        this.proyectoId,
        this.usuarioId
      );
      this.mensajeNuevo = '';
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  }

  private escucharNuevosMensajes() {
    this.subscription.add(
      this.chatService.getMensajesEnTiempoReal().subscribe(mensaje => {
        console.log('Nuevo mensaje recibido:', mensaje);
        this.agregarNuevoMensaje(mensaje);
      })
    );
  }

  private agruparMensajes(mensajes: Mensaje[]) {
    let mensajesAgrupados: MensajeAgrupado[] = [];
    let grupoActual: MensajeAgrupado | null = null;

    for (const mensaje of mensajes) {
      if (!grupoActual || grupoActual.usuario !== mensaje.usuario) {
        grupoActual = {
          usuario: mensaje.usuario,
          mensajes: [mensaje.texto],
          fecha: mensaje.fecha
        };
        mensajesAgrupados.push(grupoActual);
      } else {
        grupoActual.mensajes.push(mensaje.texto);
      }
    }

    this.mensajesAgrupados = mensajesAgrupados;
    console.log('Mensajes agrupados:', this.mensajesAgrupados);
  }

  private agregarNuevoMensaje(mensaje: Mensaje) {
    const ultimoGrupo = this.mensajesAgrupados[this.mensajesAgrupados.length - 1];
    
    if (ultimoGrupo && ultimoGrupo.usuario === mensaje.usuario) {
      ultimoGrupo.mensajes.push(mensaje.texto);
    } else {
      this.mensajesAgrupados.push({
        usuario: mensaje.usuario,
        mensajes: [mensaje.texto],
        fecha: mensaje.fecha
      });
    }
  }
}
