import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import { MaterialModules } from './material.modules';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TokenComponent } from './components/token/token.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { DatePipe } from '@angular/common';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import localeEsCO from '@angular/common/locales/es-CO';
import { NotfoundComponent } from './components/notfound/notfound.component';
import {
  NormativaComponent,
  ModalNormativaFormulario,
} from './components/marco-normativo/normativa/normativa.component';
import { NormativaGrupoComponent } from './components/marco-normativo/normativa-grupo/normativa-grupo.component';
import { FiltroNormativaEntidadTipoPipe } from './pipes/filtro-normativa-entidad-tipo.pipe';
import {
  SeccionComponent,
  ModalSeccionFormulario,
} from './components/seccion/seccion.component';
import {
  AutorizacionComponent,
  ModalAutorizacionFormulario,
} from './components/autorizacion/autorizacion.component';
import {
  ItemComponent,
  ModalItemFormulario,
} from './components/item/item.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import {
  AutorizacionItemComponent,
  ModalAutorizacionItemFormulario,
} from './components/autorizacion-item/autorizacion-item.component';
import {
  AutorizacionModuloComponent,
  ModalAutorizacionModuloFormulario,
} from './components/autorizacion-modulo/autorizacion-modulo.component';

registerLocaleData(localeEsCO, 'es-CO');

@NgModule({
  declarations: [
    AppComponent,
    TokenComponent,
    LoginComponent,
    NavbarComponent,
    InicioComponent,
    NotfoundComponent,
    ModalNormativaFormulario,
    NormativaComponent,
    NormativaGrupoComponent,
    FiltroNormativaEntidadTipoPipe,
    SeccionComponent,
    ModalSeccionFormulario,
    AutorizacionComponent,
    ModalAutorizacionFormulario,
    ItemComponent,
    ModalItemFormulario,
    AutorizacionItemComponent,
    ModalAutorizacionItemFormulario,
    AutorizacionModuloComponent,
    ModalAutorizacionModuloFormulario,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModules,
    FormsModule,
    ReactiveFormsModule,
    AngularEditorModule,
  ],
  entryComponents: [
    ModalNormativaFormulario,
    ModalSeccionFormulario,
    ModalAutorizacionFormulario,
    ModalItemFormulario,
    ModalAutorizacionItemFormulario,
    ModalAutorizacionModuloFormulario,
  ],
  providers: [
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
