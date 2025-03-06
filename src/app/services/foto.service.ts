import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { FotoAntigua } from '../models/foto-antigua';

@Injectable({
  providedIn: 'root',
})
export class FotoService {
  private url: string = `${environment.URL_BACKEND}/foto`;
  private httpHeaders = new HttpHeaders();

  userLogeado: String = this.authservice.user.username;

  constructor(private http: HttpClient, private authservice: AuthService) {}

  private aggAutorizacionHeader(): HttpHeaders {
    let token = this.authservice.Token;
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }

  mirarFoto(perCodigo: String): Observable<any> {
    return this.http.get<any>(`${this.url}/obtener-foto/${perCodigo}`, {
      headers: this.aggAutorizacionHeader(),
      responseType: 'blob' as 'json',
    });
  }

  mirarFotoAntigua(perCodigo: String): Observable<FotoAntigua> {
    return this.http.get<FotoAntigua>(
      `${this.url}/obtener-foto-antigua/${perCodigo}`,
      { headers: this.aggAutorizacionHeader() }
    );
  }
}
