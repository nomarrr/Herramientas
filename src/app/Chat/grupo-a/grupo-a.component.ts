import { Component, Input } from '@angular/core';
import { MensajeAComponent } from '../mensaje-a/mensaje-a.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grupo-a',
  standalone: true,
  imports: [CommonModule, MensajeAComponent],
  templateUrl: './grupo-a.component.html',
  styleUrl: './grupo-a.component.css'
})
export class GrupoAComponent {
  @Input() nombre: string = 'Nomar';
  @Input() mensajes: string[] = [];
}
