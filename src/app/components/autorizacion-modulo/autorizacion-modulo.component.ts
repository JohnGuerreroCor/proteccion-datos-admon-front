import { AuthService } from 'src/app/services/auth.service';
import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FloatLabelType,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Normativa } from 'src/app/models/normativa';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/services/seccion.service';
import { SeccionTipo } from 'src/app/models/seccion-tipo';
import { Sistema } from 'src/app/models/sistema';
import { Modulo } from 'src/app/models/modulo';
import { Autorizacion } from 'src/app/models/autorizacion';
import { AutorizacionService } from 'src/app/services/autorizacion.service';
import { AutorizacionModuloService } from 'src/app/services/autorizacion-modulo.service';
import { AutorizacionModulo } from 'src/app/models/autorizacion-modulo';

@Component({
  selector: 'app-autorizacion-modulo',
  templateUrl: './autorizacion-modulo.component.html',
  styleUrls: ['./autorizacion-modulo.component.css'],
})
export class AutorizacionModuloComponent implements OnInit {
  step = 0;
  claves!: string;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  dataSource = new MatTableDataSource<AutorizacionModulo>([]);
  displayedColumns: string[] = [
    'index',
    'autorizacion',
    'sistema',
    'modulo',
    'opciones',
  ];
  listadoAutorizacionModulo: AutorizacionModulo[] = [];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    public autorizacionModuloService: AutorizacionModuloService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerAutorizacionModulo();
  }

  obtenerAutorizacionModulo() {
    this.autorizacionModuloService
      .obtenerListadoAutorizacionModulo()
      .subscribe((data) => {
        this.listadoAutorizacionModulo = data;
        this.dataSource = new MatTableDataSource<AutorizacionModulo>(data);
        this.paginator.firstPage();
        this.dataSource.paginator = this.paginator;
      });
  }

  restaurar() {
    this.obtenerAutorizacionModulo();
    this.claves = '';
  }

  registrarFormulario(): void {
    this.dialogRef = this.dialog.open(ModalAutorizacionModuloFormulario, {
      width: '40%',
      disableClose: true,
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.onModalClosed();
    });
  }

  filtrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editarFormulario(element: any): void {
    this.dialogRef = this.dialog.open(ModalAutorizacionModuloFormulario, {
      width: '40%',
      disableClose: true,
      data: { autorizacionModulo: element },
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.onModalClosed();
    });
  }

  onModalClosed() {
    this.obtenerAutorizacionModulo();
  }

  editarNormativa(element: Normativa) {
    this.editarFormulario(element);
  }

  confirmarEliminado(element: AutorizacionModulo) {
    Swal.fire({
      title: '¿Está seguro de eliminar este elemento?',
      text: 'La siguiente operación será irreversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00c053',
      cancelButtonColor: '#ffc107',
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'Cancelar opreación',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminar(element);
        Swal.fire({
          icon: 'success',
          title: 'Elemento borrado.',
          confirmButtonColor: '#006983',
          confirmButtonText: 'Listo',
        });
      }
    });
  }

  eliminar(autorizacionModulo: AutorizacionModulo) {
    this.autorizacionModuloService
      .eliminarAutorizacionModulo(autorizacionModulo)
      .subscribe(
        (data) => {
          if (data > 0) {
            this.obtenerAutorizacionModulo();
          } else {
            this.mensajeError();
          }
        },
        (err) => this.fError(err)
      );
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  mensajeExitoso() {
    Swal.fire({
      icon: 'success',
      title: 'Proceso realizado',
      text: '¡Operación exitosa!',
      showConfirmButton: false,
      timer: 2500,
    });
  }

  mensajeError() {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo completar el proceso.',
      showConfirmButton: true,
      confirmButtonText: 'Listo',
      confirmButtonColor: '#8f141b',
    });
  }

  fError(er: any): void {
    let err = er.error.error_description;
    let arr: string[] = err.split(':');
    if (arr[0] == 'Access token expired') {
      this.authService.logout();
      this.router.navigate(['login']);
    } else {
      this.mensajeError();
    }
  }

  getFloatLabelValue(): FloatLabelType {
    return this.floatLabelControl.value || 'auto';
  }
}

//// MODAL

@Component({
  selector: 'modal-autorizacion-modulo-formulario',
  templateUrl: 'modal-autorizacion-modulo-formulario.html',
  styleUrls: ['./autorizacion-modulo.component.css'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class ModalAutorizacionModuloFormulario {
  editar: boolean = false;
  formulario!: FormGroup;
  listadoSistema: Sistema[] = [];
  listadoModulo: Modulo[] = [];
  listadoAutorizacion: Autorizacion[] = [];

  constructor(
    public dialogRef: MatDialogRef<ModalAutorizacionModuloFormulario>,
    private formBuilder: FormBuilder,
    public autorizacionService: AutorizacionService,
    public autorizacionModuloService: AutorizacionModuloService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.authService.validacionToken()) {
      this.crearFormulario();
      this.obtenerListadoSistema();
      this.obtenerListadoAutorizacion();
      if (JSON.stringify(data) !== 'null') {
        this.precargar(data.autorizacionModulo);
        console.log('Entra');
      } else {
        console.log('No entra');
      }
    }
  }

  private crearFormulario(): void {
    this.formulario = this.formBuilder.group({
      codigo: new FormControl(),
      autorizacionCodigo: new FormControl('', Validators.required),
      moduloCodigo: new FormControl('', Validators.required),
      sistemaCodigo: new FormControl('', Validators.required),
      estado: new FormControl(),
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  obtenerListadoSistema() {
    this.autorizacionModuloService.obtenerListadoSistema().subscribe((data) => {
      this.listadoSistema = data;
    });
  }

  obtenerListadoAutorizacion() {
    this.autorizacionService.obtenerListadoAutorizacion().subscribe((data) => {
      this.listadoAutorizacion = data;
    });
  }

  obtenerListadoModuloPorSistema(codigo: number) {
    this.autorizacionModuloService
      .obtenerListadoModuloPorSistema(codigo)
      .subscribe((data) => {
        this.listadoModulo = data;
      });
  }

  generar(): void {
    let autorizacionModulo: AutorizacionModulo = new AutorizacionModulo();
    autorizacionModulo.codigo = this.formulario.get('codigo')!.value;
    autorizacionModulo.autorizacionCodigo =
      this.formulario.get('autorizacionCodigo')!.value;
    autorizacionModulo.moduloCodigo =
      this.formulario.get('moduloCodigo')!.value;
    autorizacionModulo.estado = this.formulario.get('estado')!.value;
    if (!this.editar) {
      this.registrar(autorizacionModulo);
    } else {
      this.actualizar(autorizacionModulo);
    }
  }

  registrar(autorizacionModulo: AutorizacionModulo) {
    this.autorizacionModuloService
      .insertarAutorizacionModulo(autorizacionModulo)
      .subscribe(
        (data) => {
          if (data > 0) {
            Swal.fire({
              icon: 'success',
              title: 'Registrado',
              text: '¡Operación exitosa!',
              showConfirmButton: false,
              timer: 2500,
            });
            this.cancelar();
            this.dialogRef.close();
            this.crearFormulario();
          } else {
            this.mensajeError();
          }
        },
        (err) => this.fError(err)
      );
  }

  actualizar(autorizacionModulo: AutorizacionModulo) {
    this.autorizacionModuloService
      .actualizarAutorizacionModulo(autorizacionModulo)
      .subscribe(
        (data) => {
          if (data > 0) {
            Swal.fire({
              icon: 'success',
              title: 'Actualizado',
              text: '¡Operación exitosa!',
              showConfirmButton: false,
            });
            this.dialogRef.close();
            this.cancelar();
          } else {
            this.mensajeError();
          }
        },
        (err) => this.fError(err)
      );
  }

  precargar(element: AutorizacionModulo) {
    this.editar = true;
    this.formulario.get('codigo')!.setValue(element.codigo);
    this.formulario
      .get('autorizacionCodigo')!
      .setValue(element.autorizacionCodigo);
    this.formulario.get('sistemaCodigo')!.setValue(element.sistemaCodigo);
    this.obtenerListadoModuloPorSistema(element.sistemaCodigo);
    this.formulario.get('moduloCodigo')!.setValue(element.moduloCodigo);
    this.formulario.get('estado')!.setValue(element.estado);
  }

  cancelar() {
    this.formulario.reset();
    this.crearFormulario();
    this.editar = false;
  }

  mensajeSuccses() {
    Swal.fire({
      icon: 'success',
      title: 'Proceso realizado',
      text: '¡Operación exitosa!',
      showConfirmButton: false,
      timer: 2500,
    });
  }

  mensajeError() {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo completar el proceso.',
      showConfirmButton: true,
      confirmButtonText: 'Listo',
      confirmButtonColor: '#8f141b',
    });
  }

  fError(er: any): void {
    let err = er.error.error_description;
    let arr: string[] = err.split(':');
    if (arr[0] == 'Access token expired') {
      this.authService.logout();
      this.router.navigate(['login']);
    } else {
      this.mensajeError();
    }
  }
}
