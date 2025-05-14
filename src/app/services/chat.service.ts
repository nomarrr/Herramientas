import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface Mensaje {
  texto: string;
  fecha: string;
  usuario: string;
}

export interface MensajesResponse {
  mensajes: Mensaje[];
}

export interface EnviarMensajeRequest {
  idProy: number;
  idUsuario: number;
  mensaje: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: signalR.HubConnection;
  private mensajeRecibido = new Subject<Mensaje>();
  private readonly API_URL = 'http://localhost:5000/api/chat';
  
  constructor(private http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/chatHub')
      .withAutomaticReconnect()
      .build();

    this.iniciarConexion();
  }

  private async iniciarConexion() {
    try {
      await this.hubConnection.start();
      console.log('Conexión SignalR establecida');
      
      this.hubConnection.on('ReceiveMessage', (usuario: string, texto: string) => {
        const mensaje: Mensaje = {
          usuario: usuario,
          texto: texto,
          fecha: new Date().toISOString()
        };
        console.log('Mensaje recibido:', mensaje);
        this.mensajeRecibido.next(mensaje);
      });
    } catch (err) {
      console.error('Error al conectar con SignalR:', err);
      setTimeout(() => this.iniciarConexion(), 5000);
    }
  }

  getMensajes(proyectoId: number): Observable<MensajesResponse> {
    return this.http.get<MensajesResponse>(`${this.API_URL}/messages/${proyectoId}`);
  }

  getMensajesEnTiempoReal(): Observable<Mensaje> {
    return this.mensajeRecibido.asObservable();
  }

  async enviarMensaje(mensaje: string, usuario: string, idProy: number = 1, idUsuario: number = 1) {
    try {
      await this.http.post(`${this.API_URL}/send`, {
        IdProy: idProy,
        IdUsuario: idUsuario,
        Mensaje: mensaje,
        Nombre: usuario
      }).toPromise();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      throw err;
    }
  }
} 