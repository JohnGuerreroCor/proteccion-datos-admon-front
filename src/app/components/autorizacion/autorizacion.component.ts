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
import { MarcoNormativoService } from 'src/app/services/marco-normativo.service';
import { Normativa } from 'src/app/models/normativa';
import { Observable } from 'rxjs';
import { Autorizacion } from 'src/app/models/autorizacion';
import { AutorizacionService } from 'src/app/services/autorizacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-autorizacion',
  templateUrl: './autorizacion.component.html',
  styleUrls: ['./autorizacion.component.css'],
})
export class AutorizacionComponent implements OnInit {
  step = 0;
  claves!: string;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  dataSource = new MatTableDataSource<Autorizacion>([]);
  displayedColumns: string[] = ['index', 'titulo', 'normativa','version','fecha','opciones'];
  listadoAutorizacion: Autorizacion[] = [];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    public autorizacionService: AutorizacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerAutorizacion();
  }

  obtenerAutorizacion() {
    this.autorizacionService.obtenerListadoAutorizacion().subscribe((data) => {
      this.listadoAutorizacion = data;
      this.dataSource = new MatTableDataSource<Autorizacion>(data);
      this.paginator.firstPage();
      this.dataSource.paginator = this.paginator;
    });
  }

  restaurar() {
    this.obtenerAutorizacion();
    this.claves = '';
  }

  registrarFormulario(): void {
    this.dialogRef = this.dialog.open(ModalAutorizacionFormulario, {
      width: '70%',
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
    this.dialogRef = this.dialog.open(ModalAutorizacionFormulario, {
      width: '70%',
      disableClose: true,
      data: { autorizacion: element },
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.onModalClosed();
    });
  }

  onModalClosed() {
    this.obtenerAutorizacion();
  }

  editarAutorizacion(element: Normativa) {
    this.editarFormulario(element);
  }

  confirmarEliminado(element: Normativa) {
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
        //this.eliminar(element);
        Swal.fire({
          icon: 'success',
          title: 'Elemento borrado.',
          confirmButtonColor: '#006983',
          confirmButtonText: 'Listo',
        });
      }
    });
  }

  eliminar(autorizacion: Autorizacion) {
    this.autorizacionService.eliminarAutorizacion(autorizacion).subscribe(
      (data) => {
        if (data > 0) {
          this.obtenerAutorizacion();
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
  templateUrl: 'modal-autorizacion-formulario.html',
  styleUrls: ['./autorizacion.component.css'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class ModalAutorizacionFormulario implements OnInit {
  editar: boolean = false;
  formulario!: FormGroup;
  filteredOptions!: Observable<Normativa[]>;
  normatividad: Normativa[] = [];

  constructor(
    public dialogRef: MatDialogRef<ModalAutorizacionFormulario>,
    private formBuilder: FormBuilder,
    public autorizacionService: AutorizacionService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private marcoNormativoService: MarcoNormativoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.authService.validacionToken()) {
      this.crearFormulario();
      this.obtenerNormativa();
      if (JSON.stringify(data) !== 'null') {
        this.modificar(data.autorizacion);
        console.log('Entra');
      } else {
        console.log('No entra');
      }
    }
  }

  ngOnInit(): void {}

  private crearFormulario(): void {
    this.formulario = this.formBuilder.group({
      codigo: new FormControl(),
      titulo: new FormControl('', Validators.required),
      normativaCodigo: new FormControl('', Validators.required),
      version: new FormControl('', Validators.required),
      anexo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      estado: new FormControl(),
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  obtenerNormativa() {
    this.marcoNormativoService.obtenerNormativa().subscribe((data) => {
      this.normatividad = data;
    });
  }

  generar(): void {
    let autorizacion: Autorizacion = new Autorizacion();
    autorizacion.codigo = this.formulario.get('codigo')!.value;
    autorizacion.titulo = this.formulario.get('titulo')!.value;
    autorizacion.normativaCodigo =
      this.formulario.get('normativaCodigo')!.value;
    autorizacion.version = this.formulario.get('version')!.value;
    autorizacion.anexo = this.formulario.get('anexo')!.value;
    autorizacion.descripcion = this.formulario.get('descripcion')!.value;
    autorizacion.estado = this.formulario.get('estado')!.value;
    if (!this.editar) {
      this.registrar(autorizacion);
    } else {
      this.actualizar(autorizacion);
    }
  }

  registrar(autorizacion: Autorizacion) {
    this.autorizacionService.insertarAutorizacion(autorizacion).subscribe(
      (data) => {
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
      },
      (err) => this.fError(err)
    );
  }

  actualizar(autorizacion: Autorizacion) {
    this.autorizacionService.actualizarAutorizacion(autorizacion).subscribe(
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

  modificar(element: Autorizacion) {
    this.editar = true;
    this.formulario.get('codigo')!.setValue(element.codigo);
    this.formulario.get('titulo')!.setValue(element.titulo);
    this.formulario.get('normativaCodigo')!.setValue(element.normativaCodigo);
    this.formulario.get('version')!.setValue(element.version);
    this.formulario.get('anexo')!.setValue(''+element.anexo);
    this.formulario.get('descripcion')!.setValue(element.descripcion);
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
