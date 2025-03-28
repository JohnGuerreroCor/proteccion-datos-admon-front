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
import { CuerposColegiadosComponent } from './components/cuerpos-colegiados/cuerpos-colegiados.component';
import {
  NormativaComponent,
  ModalNormativaFormulario,
} from './components/marco-normativo/normativa/normativa.component';
import { NormativaGrupoComponent } from './components/marco-normativo/normativa-grupo/normativa-grupo.component';
import { FiltroNormativaEntidadTipoPipe } from './pipes/filtro-normativa-entidad-tipo.pipe';

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
    CuerposColegiadosComponent,
    NormativaComponent,
    NormativaGrupoComponent,
    FiltroNormativaEntidadTipoPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModules,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [ModalNormativaFormulario],
  providers: [
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
