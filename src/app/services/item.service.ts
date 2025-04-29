import { Item } from './../models/item';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private url: string = `${environment.URL_BACKEND}/item`;
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

  obtenerListadoItem(): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/obtener-listado-item`, {
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

  obtenerItemPorSeccion(codigo: number): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/obtener-item-por-seccion/${codigo}`, {
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

  obtenerItem(codigo: number): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/obtener-item/${codigo}`, {
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

  insertarItem(item: Item): Observable<number> {
    return this.http.post<number>(
      `${this.url}/registrar-item/${this.userLogeado}`,
      item,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  actualizarItem(item: Item): Observable<number> {
    return this.http.put<number>(
      `${this.url}/actualizar-item/${this.userLogeado}`,
      item,
      { headers: this.aggAutorizacionHeader() }
    );
  }

  eliminarItem(item: Item): Observable<number> {
    return this.http.put<number>(
      `${this.url}/eliminar-item/${this.userLogeado}`,
      item,
      { headers: this.aggAutorizacionHeader() }
    );
  }
}
