import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Seccion } from '../models/seccion';
import { SeccionTipo } from '../models/seccion-tipo';
import { Autorizacion } from '../models/autorizacion';

@Injectable({
  providedIn: 'root',
})
export class AutorizacionService {
  private url: string = `${environment.URL_BACKEND}/autorizacion`;
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

  obtenerListadoAutorizacion(): Observable<Autorizacion[]> {
    return this.http
      .get<Autorizacion[]>(`${this.url}/obtener-listado-autorizacion`, {
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

  obtenerAutorizacion(codigo: number): Observable<Autorizacion> {
    return this.http
      .get<Autorizacion>(`${this.url}/obtener-autorizacion/${codigo}`, {
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

  insertarAutorizacion(autorizacion: Autorizacion): Observable<number> {
    return this.http.post<number>(
      `${this.url}/registrar-autorizacion/${this.userLogeado}`,
      autorizacion,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  actualizarAutorizacion(autorizacion: Autorizacion): Observable<number> {
    return this.http.put<number>(
      `${this.url}/actualizar-autorizacion/${this.userLogeado}`,
      autorizacion,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  eliminarAutorizacion(autorizacion: Autorizacion): Observable<number> {
    return this.http.put<number>(
      `${this.url}/eliminar-autorizacion/${this.userLogeado}`,
      autorizacion,
      { headers: this.aggAutorizacionHeader() }
    );
  }
}
