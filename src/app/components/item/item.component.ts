import { AutorizacionService } from './../../services/autorizacion.service';
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
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NormativaEntidad } from 'src/app/models/normativa-entidad';
import { MarcoNormativoService } from 'src/app/services/marco-normativo.service';
import { NormativaEntidadTipo } from 'src/app/models/normativa-entidad-tipo';
import { Normativa } from 'src/app/models/normativa';
import { NormativaExpide } from 'src/app/models/norma-expide';
import { NormativaMedio } from 'src/app/models/normativa-medio';
import { NormativaTipo } from 'src/app/models/normativa-tipo';
import { Autorizacion } from 'src/app/models/autorizacion';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
})
export class ItemComponent implements OnInit {
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
  autorizacionCodigo!: number;
  autorizacion!: Autorizacion;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    public marcoNormativoService: MarcoNormativoService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private autorizacionService: AutorizacionService,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.autorizacion = params['id'];
      this.autorizacionService
        .obtenerAutorizacion(params['id'])
        .subscribe((data) => {
          this.autorizacion = data;
        });
    });
  }

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
    /* this.dialogRef = this.dialog.open(ModalNormativaFormulario, {
      width: '70%',
      disableClose: true,
    }); */
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
    /* this.dialogRef = this.dialog.open(ModalNormativaFormulario, {
      width: '70%',
      disableClose: true,
      data: { normativa: element },
    }); */
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
