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
import { NormativaEntidad } from 'src/app/models/normativa-entidad';
import { MarcoNormativoService } from 'src/app/services/marco-normativo.service';
import { NormativaEntidadTipo } from 'src/app/models/normativa-entidad-tipo';
import { Normativa } from 'src/app/models/normativa';
import { NormativaExpide } from 'src/app/models/norma-expide';
import { NormativaMedio } from 'src/app/models/normativa-medio';
import { NormativaTipo } from 'src/app/models/normativa-tipo';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/services/seccion.service';
import { SeccionTipo } from 'src/app/models/seccion-tipo';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html',
  styleUrls: ['./seccion.component.css'],
})
export class SeccionComponent implements OnInit {
  step = 0;
  claves!: string;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  dataSource = new MatTableDataSource<Seccion>([]);
  displayedColumns: string[] = ['index', 'nombre', 'orden', 'tipo', 'opciones'];
  listadoSeccion: Seccion[] = [];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    public seccionService: SeccionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerSeccion();
  }

  obtenerSeccion() {
    this.seccionService.obtenerListadoSeccion().subscribe((data) => {
      this.listadoSeccion = data;
      this.dataSource = new MatTableDataSource<Seccion>(data);
      this.paginator.firstPage();
      this.dataSource.paginator = this.paginator;
    });
  }

  restaurar() {
    this.obtenerSeccion();
    this.claves = '';
  }

  registrarFormulario(): void {
    this.dialogRef = this.dialog.open(ModalSeccionFormulario, {
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
    this.dialogRef = this.dialog.open(ModalSeccionFormulario, {
      width: '40%',
      disableClose: true,
      data: { seccion: element },
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.onModalClosed();
    });
  }

  onModalClosed() {
    this.obtenerSeccion();
  }

  editarNormativa(element: Normativa) {
    this.editarFormulario(element);
  }

  confirmarEliminado(element: Seccion) {
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

  eliminar(seccion: Seccion) {
    this.seccionService.eliminarSeccion(seccion).subscribe(
      (data) => {
        if (data > 0) {
          this.obtenerSeccion();
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
  selector: 'modal-seccion-formulario',
  templateUrl: 'modal-seccion-formulario.html',
  styleUrls: ['./seccion.component.css'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class ModalSeccionFormulario {
  editar: boolean = false;
  formularioLey!: FormGroup;
  listadoSeccionTipo: SeccionTipo[] = [];

  constructor(
    public dialogRef: MatDialogRef<ModalSeccionFormulario>,
    private formBuilder: FormBuilder,
    public seccionService: SeccionService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.authService.validacionToken()) {
      this.crearFormulario();
      this.obtenerListadoSeccionTipo();
      if (JSON.stringify(data) !== 'null') {
        this.editarSeccion(data.seccion);
        console.log('Entra');
      } else {
        console.log('No entra');
      }
    }
  }

  private crearFormulario(): void {
    this.formularioLey = this.formBuilder.group({
      codigo: new FormControl(),
      nombre: new FormControl('', Validators.required),
      orden: new FormControl('', Validators.required),
      seccionTipoCodigo: new FormControl('', Validators.required),
      estado: new FormControl(),
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  obtenerListadoSeccionTipo() {
    this.seccionService.obtenerListadoSeccionTipo().subscribe((data) => {
      this.listadoSeccionTipo = data;
    });
  }

  generarSeccion(): void {
    let seccion: Seccion = new Seccion();
    seccion.codigo = this.formularioLey.get('codigo')!.value;
    seccion.nombre = this.formularioLey.get('nombre')!.value;
    seccion.orden = this.formularioLey.get('orden')!.value;
    seccion.seccionTipoCodigo =
      this.formularioLey.get('seccionTipoCodigo')!.value;
    seccion.estado = this.formularioLey.get('estado')!.value;
    if (!this.editar) {
      this.registrarSeccion(seccion);
    } else {
      this.actualizarSeccion(seccion);
    }
  }

  registrarSeccion(seccion: Seccion) {
    this.seccionService.insertarSeccion(seccion).subscribe(
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

  actualizarSeccion(seccion: Seccion) {
    this.seccionService.actualizarSeccion(seccion).subscribe(
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

  editarSeccion(element: Seccion) {
    this.editar = true;
    this.formularioLey.get('codigo')!.setValue(element.codigo);
    this.formularioLey.get('nombre')!.setValue(element.nombre);
    this.formularioLey.get('orden')!.setValue(element.orden);
    this.formularioLey
      .get('seccionTipoCodigo')!
      .setValue(element.seccionTipoCodigo);
    this.formularioLey.get('estado')!.setValue(element.estado);
  }

  cancelar() {
    this.formularioLey.reset();
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
