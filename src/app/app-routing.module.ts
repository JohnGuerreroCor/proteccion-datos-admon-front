import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { TokenComponent } from './components/token/token.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { AuthGuard } from './guard/auth.guard';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { NormativaComponent } from './components/marco-normativo/normativa/normativa.component';
import { SeccionComponent } from './components/seccion/seccion.component';
import { AutorizacionComponent } from './components/autorizacion/autorizacion.component';
import { ItemComponent } from './components/item/item.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'acceso-denegado', component: NotfoundComponent },

  { path: 'login', component: LoginComponent },
  { path: 'token', component: TokenComponent },

  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] },
  {
    path: 'marco-normativo',
    component: NormativaComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'seccion',
    component: SeccionComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'autorizacion',
    component: AutorizacionComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'item/:id',
    component: ItemComponent,
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: 'acceso-denegado' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
