import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { NormativaEntidad } from '../models/normativa-entidad';
import { NormativaEntidadTipo } from '../models/normativa-entidad-tipo';
import { Normativa } from '../models/normativa';
import { NormativaExpide } from '../models/norma-expide';
import { NormativaMedio } from '../models/normativa-medio';
import { NormativaTipo } from '../models/normativa-tipo';

@Injectable({
  providedIn: 'root',
})
export class MarcoNormativoService {
  private url: string = `${environment.URL_BACKEND}/normativo`;
  private httpHeaders = new HttpHeaders();

  userLogeado: String = this.authservice.user.username;

  private uaa = this.authservice.user.uaaCodigo;
  private perCodigo = this.authservice.user.personaCodigo;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authservice: AuthService
  ) {}

  private aggAutorizacionHeader(): HttpHeaders {
    let token = this.authservice.Token;
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }

  private isNoAutorizado(e: any): boolean {
    if (e.status == 401 || e.status == 403) {
      if (this.authservice.isAuthenticated()) {
        this.authservice.logout();
      }
      this.router.navigate(['login']);
      return true;
    }
    return false;
  }

  obtenerNormativaEntidadTipo(): Observable<NormativaEntidadTipo[]> {
    return this.http.get<NormativaEntidadTipo[]>(
      `${this.url}/obtener-entidad-tipo`,
      {
        headers: this.aggAutorizacionHeader(),
      }
    );
  }

  obtenerNormativaEntidades(): Observable<NormativaEntidad[]> {
    return this.http.get<NormativaEntidad[]>(
      `${this.url}/obtener-entidad`,
      {
        headers: this.aggAutorizacionHeader(),
      }
    );
  }

  obtenerNormativaTipo(): Observable<NormativaTipo[]> {
    return this.http.get<NormativaTipo[]>(
      `${this.url}/obtener-normativa-tipo`,
      {
        headers: this.aggAutorizacionHeader(),
      }
    );
  }

  obtenerNormativaMedio(): Observable<NormativaMedio[]> {
    return this.http.get<NormativaMedio[]>(
      `${this.url}/obtener-medio`,
      {
        headers: this.aggAutorizacionHeader(),
      }
    );
  }

  obtenerNormativa(): Observable<Normativa[]> {
    return this.http.get<Normativa[]>(`${this.url}/obtener-normativa`, {
      headers: this.aggAutorizacionHeader(),
    });
  }

  obtenerEntidadesPorTipo(codigo: number): Observable<NormativaEntidad[]> {
    return this.http.get<NormativaEntidad[]>(
      `${this.url}/obtener-entidades-por-tipo/${codigo}`,
      {
        headers: this.aggAutorizacionHeader(),
      }
    );
  }

  obtenerNormativaExpidePorEntidad(
    codigo: number
  ): Observable<NormativaExpide[]> {
    return this.http.get<NormativaExpide[]>(
      `${this.url}/obtener-expide-por-entidad/${codigo}`,
      {
        headers: this.aggAutorizacionHeader(),
      }
    );
  }

  registrarNormativa(archivo: File, json: Normativa): Observable<null> {
    console.log(archivo);
    console.log(json);
    let formData: FormData = new FormData();
    formData.set('archivo', archivo);
    formData.set('json', JSON.stringify(json));

    return this.http.post<null>(
      `${this.url}/registrar-normativa/${this.userLogeado}/${this.perCodigo}/${this.uaa}`,
      formData,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  actualizarLey(normativa: Normativa): Observable<number> {
    return this.http.put<number>(
      `${this.url}/actualizar-ley/${this.userLogeado}`,
      normativa,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  obtenerArchivo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.url}/mirar-archivo/${codigo}`, {
      headers: this.aggAutorizacionHeader(),
      responseType: 'blob' as 'json',
    });
  }
}
