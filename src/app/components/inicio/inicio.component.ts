import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  links = [
    {
      titulo: 'Marco Normativo',
      ruta: '/marco-normativo',
      icono:
        'fa-solid fa-scale-balanced fa-6x text-center color-icon color-icon',
      info: 'Permite parametrizar y gestionar normas internas y externas, lineamientos y requisitos según el marco normativo de la organización.',
    },
    {
      titulo: 'Tasa de graduación',
      ruta: '/tasa-graduacion',
      icono: 'fa-solid fa-chart-pie fa-6x text-center color-icon',
      info: 'Permite parametrizar y gestionar normas internas y externas, lineamientos y requisitos según el marco normativo de la organización.',
    },
    {
      titulo: 'Puesto de votación',
      ruta: '/puesto-votacion',
      icono: 'fa-solid fa-check-to-slot fa-6x text-center color-icon',
      info: 'Permite parametrizar y gestionar normas internas y externas, lineamientos y requisitos según el marco normativo de la organización.',
    },
    {
      titulo: 'Reportes',
      ruta: '/reportes',
      icono: 'fa-solid fa-chart-simple fa-6x text-center color-icon',
      info: 'Permite parametrizar y gestionar normas internas y externas, lineamientos y requisitos según el marco normativo de la organización.',
    },
  ];

  anio!: number;
  fecha = new Date();
  url: string = environment.URL_BACKEND;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
    } else {
    }
    this.anio = this.fecha.getUTCFullYear();
  }

  mensajeError() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Ocurrio Un Error!',
    });
  }

  mensajeSuccses() {
    Swal.fire({
      icon: 'success',
      title: 'Proceso Realizado',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  fError(er: any): void {
    let err = er.error.error_description;
    let arr: string[] = err.split(':');

    if (arr[0] == 'Access token expired') {
      this.auth.logout();
      this.router.navigate(['login']);
    } else {
      this.mensajeError();
    }
  }
}
