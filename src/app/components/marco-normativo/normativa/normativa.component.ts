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

@Component({
  selector: 'app-normativa',
  templateUrl: './normativa.component.html',
  styleUrls: ['./normativa.component.css'],
})
export class NormativaComponent implements OnInit {
  step = 0;
  entidad!: string;
  entidadInterna!: string;
  entidadExterna!: string;
  cuerpoColegiado!: string;
  tipoNorma!: string;
  medio!: string;
  deroga!: string;
  claves!: string;

  fechaActual = new Date();
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  dataSource = new MatTableDataSource<Normativa>([]);
  displayedColumns: string[] = [
    'index',
    'entidad',
    'nombre',
    'fechaExpedicion',
    'fechaVigencia',
    'opciones',
  ];
  listadoNormativa: Normativa[] = [];
  listadoNormativaEntidadTipo: NormativaEntidadTipo[] = [];
  listadoNormativaEntidad: NormativaEntidad[] = [];
  listadoNormativaTipo: NormativaTipo[] = [];
  listadoNormativaMedio: NormativaMedio[] = [];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    public marcoNormativoService: MarcoNormativoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerNormativaTipo();
    this.obtenerNormativaEntidades();
    this.obtenerNormativa();
    this.obtenerEntidadesTipo();
    this.obtenerMedios();
  }

  obtenerNormativa() {
    this.marcoNormativoService.obtenerNormativa().subscribe((data) => {
      this.listadoNormativa = data;
      this.dataSource = new MatTableDataSource<Normativa>(data);
      this.paginator.firstPage();
      this.dataSource.paginator = this.paginator;
    });
  }

  obtenerNormativaEntidades() {
    this.marcoNormativoService.obtenerNormativaEntidades().subscribe((data) => {
      this.listadoNormativaEntidad = data;
    });
  }

  obtenerNormativaTipo() {
    this.marcoNormativoService.obtenerNormativaTipo().subscribe((data) => {
      this.listadoNormativaTipo = data;
    });
  }

  obtenerEntidadesTipo() {
    this.marcoNormativoService
      .obtenerNormativaEntidadTipo()
      .subscribe((data) => {
        this.listadoNormativaEntidadTipo = data;
      });
  }

  obtenerMedios() {
    this.marcoNormativoService.obtenerNormativaMedio().subscribe((data) => {
      this.listadoNormativaMedio = data;
    });
  }

  restaurar() {
    this.obtenerNormativa();
    this.claves = '';
    this.entidad = '';
    this.cuerpoColegiado = '';
    this.tipoNorma = '';
    this.entidadExterna = '';
    this.entidadInterna = '';
    this.deroga = '';
    this.medio = '';
  }

  mostrarArchivo(archivoCodigo: number) {
    this.marcoNormativoService
      .obtenerArchivo(archivoCodigo)
      .subscribe((data) => {
        var blob = new Blob([data], { type: 'application/pdf' });
        var fileURL = URL.createObjectURL(blob);
        window.open(fileURL);
      });
  }

  vistaNorma(element: any) {}
  eliminarNorma(element: any) {}
  editarNorma(element: any) {}
  registrarFormularioDeroga(element: any) {}

  registrarFormulario(): void {
    this.dialogRef = this.dialog.open(ModalNormativaFormulario, {
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
    this.dialogRef = this.dialog.open(ModalNormativaFormulario, {
      width: '70%',
      disableClose: true,
      data: { normativa: element },
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.onModalClosed();
    });
  }

  botonActivo(element: Normativa): boolean {
    if (element.fechaVigencia === null) {
      return false; // Retorna verdadero si la fecha es nula
    }
    const fechaJson = new Date(element.fechaVigencia);
    return fechaJson <= this.fechaActual;
  }

  onModalClosed() {
    this.obtenerNormativa();
  }

  editarNormativa(element: Normativa) {
    this.editarFormulario(element);
  }

  eliminar(element: Normativa) {
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
        //element.estado = 0;
        this.actualizarLey(element);
        Swal.fire({
          icon: 'success',
          title: 'Elemento borrado.',
          confirmButtonColor: '#006983',
          confirmButtonText: 'Listo',
        });
      }
    });
  }

  actualizarLey(ley: Normativa) {
    /* this.leyService.actualizarLey(ley).subscribe(
      (data) => {
        if (data > 0) {
          this.obtenerListadoLey();
        } else {
          this.mensajeError();
        }
      },
      (err) => this.fError(err)
    ); */
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
  selector: 'modal-normativa-formulario',
  templateUrl: 'modal-normativa-formulario.html',
  styleUrls: ['./normativa.component.css'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class ModalNormativaFormulario {
  nombreArchivo = 'Seleccione el documento';
  file!: FileList;
  listadoPaises = [
    {
      codigo: 1,
      nombre: 'Prueba Uno',
    },
    {
      codigo: 2,
      nombre: 'Prueba Dos',
    },
    {
      codigo: 3,
      nombre: 'Prueba Tres',
    },
  ];
  editar: boolean = false;
  listadoNormativaEntidadTipo: NormativaEntidadTipo[] = [];
  listadoNormativaEntidad: NormativaEntidad[] = [];
  listadoNormativaExpide: NormativaExpide[] = [];
  listadoNormativaMedio: NormativaMedio[] = [];

  formularioLey!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ModalNormativaFormulario>,
    private formBuilder: FormBuilder,
    public marcoNormativoService: MarcoNormativoService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.authService.validacionToken()) {
      this.obtenerNormativaEntidadTipo();
      this.crearFormularioLey();
      this.obtenerNormativaMedio();
      if (JSON.stringify(data) !== 'null') {
        this.editarAmplio(data.normativa);
        console.log('Entra');
      } else {
        console.log('No entra');
      }
    }
  }

  private crearFormularioLey(): void {
    this.formularioLey = this.formBuilder.group({
      codigo: new FormControl(),
      entidadTipo: new FormControl(),
      entidad: new FormControl(),
      numero: new FormControl('', Validators.required),
      nombre: new FormControl('', Validators.required),
      normativaExpideCodigo: new FormControl('', Validators.required),
      normativaMedioCodigo: new FormControl('', Validators.required),
      url: new FormControl(),
      anexo: new FormControl('', Validators.required),
      fechaCreacion: new FormControl('', Validators.required),
      fechaVigencia: new FormControl(),
      deroga: new FormControl('', Validators.required),
      observacion: new FormControl(),
      estado: new FormControl(),
    });
  }

  obtenerNormativaEntidadTipo() {
    this.marcoNormativoService
      .obtenerNormativaEntidadTipo()
      .subscribe((data) => {
        this.listadoNormativaEntidadTipo = data;
      });
  }

  obtenerEntidadesPorTipo(codigo: number) {
    this.marcoNormativoService
      .obtenerEntidadesPorTipo(codigo)
      .subscribe((data) => {
        this.listadoNormativaEntidad = data;
      });
  }

  obtenerNormativaExpidePorEntidad(codigo: number) {
    this.marcoNormativoService
      .obtenerNormativaExpidePorEntidad(codigo)
      .subscribe((data) => {
        this.listadoNormativaExpide = data;
      });
  }

  obtenerNormativaMedio() {
    this.marcoNormativoService.obtenerNormativaMedio().subscribe((data) => {
      this.listadoNormativaMedio = data;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  generarLey(): void {
    let normativa: Normativa = new Normativa();
    normativa.codigo = this.formularioLey.get('codigo')!.value;
    normativa.numero = this.formularioLey.get('numero')!.value;
    normativa.nombre = this.formularioLey.get('nombre')!.value;
    normativa.normativaExpideCodigo = this.formularioLey.get(
      'normativaExpideCodigo'
    )!.value;
    normativa.normativaMedioCodigo = this.formularioLey.get(
      'normativaMedioCodigo'
    )!.value;
    normativa.url = this.formularioLey.get('url')!.value;
    normativa.anexo = this.formularioLey.get('anexo')!.value;
    normativa.fechaCreacion = this.formularioLey.get('fechaCreacion')!.value;
    normativa.fechaVigencia = this.formularioLey.get('fechaVigencia')!.value;
    normativa.deroga = this.formularioLey.get('deroga')!.value;
    normativa.observacion = this.formularioLey.get('observacion')!.value;
    normativa.estado = this.formularioLey.get('estado')!.value;
    console.log('FILE:: ', this.file);

    let file: any = this.file;
    if (!this.editar) {
      this.registrarLey(normativa, file);
    } else {
      this.actualizarLey(normativa);
    }
  }

  registrarLey(normativa: Normativa, file: any) {
    const arch = new File([file], this.nombreArchivo, { type: file.type });
    this.marcoNormativoService.registrarNormativa(arch, normativa).subscribe(
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
        this.crearFormularioLey();
      },
      (err) => this.fError(err)
    );
  }

  actualizarLey(normativa: Normativa) {
    this.marcoNormativoService.actualizarLey(normativa).subscribe(
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

  editarAmplio(element: Normativa) {
    this.obtenerEntidadesPorTipo(element.normativaEntidadTipoCodigo);
    this.obtenerNormativaExpidePorEntidad(element.normativaEntidadCodigo);
    this.editar = true;
    this.formularioLey.get('codigo')!.setValue(element.codigo);
    this.formularioLey
      .get('entidadTipo')!
      .setValue(element.normativaEntidadTipoCodigo);
    this.formularioLey.get('entidad')!.setValue(element.normativaEntidadCodigo);
    this.formularioLey.get('numero')!.setValue(element.numero);
    this.formularioLey.get('nombre')!.setValue(element.nombre);
    this.formularioLey
      .get('normativaExpideCodigo')!
      .setValue(element.normativaExpideCodigo);
    this.formularioLey
      .get('normativaMedioCodigo')!
      .setValue(element.normativaMedioCodigo);
    this.formularioLey.get('url')!.setValue(element.url);
    this.formularioLey.get('anexo')!.setValue(element.anexo);
    this.formularioLey.get('fechaCreacion')!.setValue(element.fechaCreacion);
    this.formularioLey.get('fechaVigencia')!.setValue(element.fechaVigencia);
    this.formularioLey.get('deroga')!.setValue('' + element.deroga);
    this.formularioLey.get('observacion')!.setValue(element.observacion);
    this.formularioLey.get('estado')!.setValue(element.estado);
  }

  change(file: any): void {
    this.nombreArchivo = file.target.files[0].name.replace(/\s/g, '');
    //this.formDatosExpedicion.get('archivo')!.setValue(this.nombreArchivo);
    if (file.target.files[0].size > 8100000) {
      Swal.fire({
        title: 'El archivo supera el limite de tamaño que es de 8mb',
        confirmButtonText: 'Entiendo',
        confirmButtonColor: '#8f141b',
        showConfirmButton: true,
      });
    } else {
      this.file = file.target.files[0];
      Swal.fire({
        icon: 'success',
        title: 'Documento cargado de manera exitosa.',
        showConfirmButton: true,
        confirmButtonText: 'Listo',
        confirmButtonColor: '#8f141b',
      });
    }
  }

  cancelar() {
    this.formularioLey.reset();
    this.crearFormularioLey();
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
