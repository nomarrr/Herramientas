import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mensaje-b',
  standalone: true,
  imports: [],
  templateUrl: './mensaje-b.component.html',
  styleUrl: './mensaje-b.component.css'
})
export class MensajeBComponent {
  @Input() mensaje: string = '';
}
