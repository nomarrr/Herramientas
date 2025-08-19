import { Routes } from '@angular/router';
import { InfoUsuarioComponent } from './info-usuario/info-usuario.component';
import { ContenedorChatComponent } from './Chat/contenedor-chat/contenedor-chat.component';
import { BrainstormComponent } from './brainstorm/brainstorm.component';
import { MenuComponent } from './menu/menu.component';
import { CategorizerComponent } from './categorizer/categorizer.component';
import { CommenterComponent } from './commenter/commenter.component';
import { ReviewCommentsComponent } from './review-comments/review-comments.component';
import { VotingComponent } from './voting/voting.component';
import { ReviewVotingComponent } from './review-voting/review-voting.component';

export const routes: Routes = [
  { path: '', redirectTo: '/info-usuario', pathMatch: 'full' },
  { path: 'info-usuario', component: InfoUsuarioComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'chat', component: ContenedorChatComponent },
  { path: 'brainstorm', component: BrainstormComponent },
  { path: 'categorizer', component: CategorizerComponent },
  { path: 'commenter', component: CommenterComponent },
  { path: 'review-comments', component: ReviewCommentsComponent },
  { path: 'voting', component: VotingComponent },
  { path: 'review-voting', component: ReviewVotingComponent },
];

