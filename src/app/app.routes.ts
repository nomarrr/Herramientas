import { Routes } from '@angular/router';
import { InfoUsuarioComponent } from './info-usuario/info-usuario.component';
import { ContenedorChatComponent } from './Chat/contenedor-chat/contenedor-chat.component';
import { BrainstormComponent } from './brainstorm/brainstorm.component';

export const routes: Routes = [
  { path: '', redirectTo: '/info-usuario', pathMatch: 'full' },
  { path: 'info-usuario', component: InfoUsuarioComponent },
  { path: 'chat', component: ContenedorChatComponent },
  { path: 'brainstorm', component: BrainstormComponent }
];

