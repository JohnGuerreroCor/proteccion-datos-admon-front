import { Sistema } from './../models/sistema';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { AutorizacionModulo } from '../models/autorizacion-modulo';
import { Modulo } from '../models/modulo';

@Injectable({
  providedIn: 'root',
})
export class AutorizacionModuloService {
  private url: string = `${environment.URL_BACKEND}/autorizacionModulo`;
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });

  userLogeado: String = this.authservice.user.username;

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

  obtenerListadoModulo(): Observable<Modulo[]> {
    return this.http
      .get<Modulo[]>(`${this.url}/obtener-listado-modulo`, {
        headers: this.aggAutorizacionHeader(),
      })
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }
          return throwError(e);
        })
      );
  }

  obtenerListadoModuloPorSistema(codigo: number): Observable<Modulo[]> {
    return this.http
      .get<Modulo[]>(
        `${this.url}/obtener-listado-modulo-por-sistema/${codigo}`,
        {
          headers: this.aggAutorizacionHeader(),
        }
      )
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }
          return throwError(e);
        })
      );
  }

  obtenerListadoSistema(): Observable<Sistema[]> {
    return this.http
      .get<Sistema[]>(`${this.url}/obtener-listado-sistema`, {
        headers: this.aggAutorizacionHeader(),
      })
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }
          return throwError(e);
        })
      );
  }

  obtenerListadoAutorizacionModulo(): Observable<AutorizacionModulo[]> {
    return this.http
      .get<AutorizacionModulo[]>(
        `${this.url}/obtener-listado-autorizacionModulo`,
        {
          headers: this.aggAutorizacionHeader(),
        }
      )
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }
          return throwError(e);
        })
      );
  }

  obtenerListadoModuloPorAutorizacion(
    codigo: number
  ): Observable<AutorizacionModulo[]> {
    return this.http
      .get<AutorizacionModulo[]>(
        `${this.url}/obtener-listado-modulo-por-autorizacion/${codigo}`,
        {
          headers: this.aggAutorizacionHeader(),
        }
      )
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }
          return throwError(e);
        })
      );
  }

  obtenerAutorizacionModulo(codigo: number): Observable<AutorizacionModulo[]> {
    return this.http
      .get<AutorizacionModulo[]>(
        `${this.url}/obtener-autorizacionModulo/${codigo}`,
        {
          headers: this.aggAutorizacionHeader(),
        }
      )
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }
          return throwError(e);
        })
      );
  }

  insertarAutorizacionModulo(
    AutorizacionModulo: AutorizacionModulo
  ): Observable<number> {
    return this.http.post<number>(
      `${this.url}/registrar-autorizacionModulo/${this.userLogeado}`,
      AutorizacionModulo,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  actualizarAutorizacionModulo(
    AutorizacionModulo: AutorizacionModulo
  ): Observable<number> {
    return this.http.put<number>(
      `${this.url}/actualizar-autorizacionModulo/${this.userLogeado}`,
      AutorizacionModulo,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  eliminarAutorizacionModulo(
    AutorizacionModulo: AutorizacionModulo
  ): Observable<number> {
    return this.http.put<number>(
      `${this.url}/eliminar-autorizacionModulo/${this.userLogeado}`,
      AutorizacionModulo,
      { headers: this.aggAutorizacionHeader() }
    );
  }
}
