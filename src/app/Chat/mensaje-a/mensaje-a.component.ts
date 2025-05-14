import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mensaje-a',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mensaje-a.component.html',
  styleUrl: './mensaje-a.component.css'
})
export class MensajeAComponent {
  @Input() mensaje: string = '';
  @Input() nombre: string = '';
}
