import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { AutorizacionItem } from '../models/autorizacion-item';

@Injectable({
  providedIn: 'root',
})
export class AutorizacionItemService {
  private url: string = `${environment.URL_BACKEND}/autorizacionItem`;
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

  obtenerListadoAutorizacionItem(): Observable<AutorizacionItem[]> {
    return this.http
      .get<AutorizacionItem[]>(`${this.url}/obtener-listado-autorizacionItem`, {
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

  obtenerItemPorAutorizacionItem(
    codigo: number
  ): Observable<AutorizacionItem[]> {
    return this.http
      .get<AutorizacionItem[]>(
        `${this.url}/obtener-item-por-autorizacion/${codigo}`,
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

  obtenerAutorizacionItem(codigo: number): Observable<AutorizacionItem[]> {
    return this.http
      .get<AutorizacionItem[]>(
        `${this.url}/obtener-autorizacionItem/${codigo}`,
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

  insertarAutorizacionItem(
    autorizacionItem: AutorizacionItem
  ): Observable<number> {
    return this.http.post<number>(
      `${this.url}/registrar-autorizacionItem/${this.userLogeado}`,
      autorizacionItem,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  actualizarAutorizacionItem(
    autorizacionItem: AutorizacionItem
  ): Observable<number> {
    return this.http.put<number>(
      `${this.url}/actualizar-autorizacionItem/${this.userLogeado}`,
      autorizacionItem,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  eliminarAutorizacionItem(
    autorizacionItem: AutorizacionItem
  ): Observable<number> {
    return this.http.put<number>(
      `${this.url}/eliminar-autorizacionItem/${this.userLogeado}`,
      autorizacionItem,
      { headers: this.aggAutorizacionHeader() }
    );
  }
}
