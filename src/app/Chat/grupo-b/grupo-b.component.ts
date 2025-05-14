import { Component, Input } from '@angular/core';
import { MensajeBComponent } from '../mensaje-b/mensaje-b.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grupo-b',
  standalone: true,
  imports: [CommonModule, MensajeBComponent],
  templateUrl: './grupo-b.component.html',
  styleUrl: './grupo-b.component.css'
})
export class GrupoBComponent {
  @Input() nombre: string = 'Nomar2';
  @Input() mensajes: string[] = [];
}
