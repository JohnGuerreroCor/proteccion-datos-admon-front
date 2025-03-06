import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Correo } from '../models/correo';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private url: any = environment.URL_BACKEND;
  private usuario: Usuario = new Usuario();
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });
  userLogeado: any = this.authservice.user.username;

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

  gettokenUsco(): Observable<Correo> {
    this.usuario = JSON.parse(
      sessionStorage.getItem('usuario') || '{}'
    ) as Usuario;
    if (JSON.stringify(this.usuario.username) === '') {
      this.router.navigate(['/login']);
    }
    return this.http
      .get<Correo>(this.url + '/getToken/' + this.usuario.username, {
        headers: this.aggAutorizacionHeader(),
      })
      .pipe(
        catchError((e) => {
          return throwError(e);
        })
      );
  }

  validartokenUsco(codigo: String): Observable<String> {
    return this.http
      .get<String>(
        this.url + '/validarToken/' + this.usuario.username + '/' + codigo,
        { headers: this.aggAutorizacionHeader() }
      )
      .pipe(
        catchError((e) => {
          if (e.status == 400) {
            const Toast = swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', swal.stopTimer);
                toast.addEventListener('mouseleave', swal.resumeTimer);
              },
            });

            Toast.fire({
              icon: 'error',
              title: `${e.error.mensaje}.`,
            });
            return throwError(e);
          }

          return throwError(e);
        })
      );
  }
}
