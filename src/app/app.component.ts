import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MensajeAComponent } from './Chat/mensaje-a/mensaje-a.component';
import { MensajeBComponent } from "./Chat/mensaje-b/mensaje-b.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MensajeAComponent, MensajeBComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Herramientas';
}
