import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Seccion } from '../models/seccion';
import { SeccionTipo } from '../models/seccion-tipo';

@Injectable({
  providedIn: 'root',
})
export class SeccionService {
  private url: string = `${environment.URL_BACKEND}/seccion`;
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

  obtenerListadoSeccion(): Observable<Seccion[]> {
    return this.http
      .get<Seccion[]>(`${this.url}/obtener-listado-seccion`, {
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

  obtenerListadoSeccionTipo(): Observable<SeccionTipo[]> {
    return this.http
      .get<SeccionTipo[]>(`${this.url}/obtener-listado-seccion-tipo`, {
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

  obtenerSeccion(codigo: number): Observable<Seccion[]> {
    return this.http
      .get<Seccion[]>(`${this.url}/obtener-seccion/${codigo}`, {
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

  insertarSeccion(seccion: Seccion): Observable<number> {
    return this.http.post<number>(
      `${this.url}/registrar-seccion/${this.userLogeado}`,
      seccion,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  actualizarSeccion(seccion: Seccion): Observable<number> {
    return this.http.put<number>(
      `${this.url}/actualizar-seccion/${this.userLogeado}`,
      seccion,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  eliminarSeccion(seccion: Seccion): Observable<number> {
    return this.http.put<number>(
      `${this.url}/eliminar-seccion/${this.userLogeado}`,
      seccion,
      { headers: this.aggAutorizacionHeader() }
    );
  }
}
