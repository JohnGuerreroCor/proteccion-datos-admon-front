import { AutorizacionService } from './../../services/autorizacion.service';
import { AutorizacionItemService } from './../../services/autorizacion-item.service';
import { ItemService } from './../../services/item.service';
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
import { Normativa } from 'src/app/models/normativa';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/services/seccion.service';
import { Item } from 'src/app/models/item';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Autorizacion } from 'src/app/models/autorizacion';
import { AutorizacionItem } from 'src/app/models/autorizacion-item';

@Component({
  selector: 'app-autorizacion-item',
  templateUrl: './autorizacion-item.component.html',
  styleUrls: ['./autorizacion-item.component.css'],
})
export class AutorizacionItemComponent implements OnInit {
  step = 0;
  claves!: string;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  dataSource = new MatTableDataSource<AutorizacionItem>([]);
  displayedColumns: string[] = ['index', 'seccion', 'contenido', 'opciones'];
  listadoAutorizacionItem: AutorizacionItem[] = [];
  autorizacion!: Autorizacion;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    public seccionService: SeccionService,
    public itemService: ItemService,
    public autorizacionItemService: AutorizacionItemService,
    public autorizacionService: AutorizacionService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.autorizacionService
        .obtenerAutorizacion(params['id'])
        .subscribe((data) => {
          this.autorizacion = data;
        });
    });
  }

  ngOnInit(): void {
    this.obtenerSeccion();
  }

  obtenerSeccion() {
    this.activatedRoute.params.subscribe((params) => {
      this.autorizacionService
        .obtenerAutorizacion(params['id'])
        .subscribe((data) => {
          this.autorizacionItemService
            .obtenerItemPorAutorizacionItem(data.codigo)
            .subscribe((data) => {
              this.listadoAutorizacionItem = data;
              this.dataSource = new MatTableDataSource<AutorizacionItem>(data);
              this.paginator.firstPage();
              this.dataSource.paginator = this.paginator;
            });
        });
    });
  }

  restaurar() {
    this.obtenerSeccion();
    this.claves = '';
  }

  registrarFormulario(): void {
    this.dialogRef = this.dialog.open(ModalAutorizacionItemFormulario, {
      width: '80%',
      disableClose: true,
      data: {
        autorizacion: this.autorizacion.codigo, // <-- importante
      },
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
    this.dialogRef = this.dialog.open(ModalAutorizacionItemFormulario, {
      width: '80%',
      disableClose: true,
      data: { item: element, autorizacion: this.autorizacion.codigo },
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

  confirmarEliminado(element: AutorizacionItem) {
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

  eliminar(autorizacionItem: AutorizacionItem) {
    this.autorizacionItemService
      .eliminarAutorizacionItem(autorizacionItem)
      .subscribe(
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
  selector: 'modal-autorizacion-item-formulario',
  templateUrl: 'modal-autorizacion-item-formulario.html',
  styleUrls: ['./autorizacion-item.component.css'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class ModalAutorizacionItemFormulario {
  editar: boolean = false;
  formulario!: FormGroup;
  listadoSeccion: Seccion[] = [];
  listadoItemsPorSeccion: Item[] = [];
  autorizacion!: Autorizacion;

  constructor(
    public dialogRef: MatDialogRef<ModalAutorizacionItemFormulario>,
    private formBuilder: FormBuilder,
    public seccionService: SeccionService,
    public itemService: ItemService,
    public autorizacionService: AutorizacionService,
    public autorizacionItemService: AutorizacionItemService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.authService.validacionToken()) {
      this.crearFormulario();
      this.obtenerListadoSeccion();

      // Asignar la autorización directamente del data
      this.autorizacion = new Autorizacion();
      this.autorizacion.codigo = data.autorizacion;

      if (data.item) {
        this.precargar(data.item);
        console.log('Entra');
      } else {
        console.log('No entra');
      }
    }
  }

  private crearFormulario(): void {
    this.formulario = this.formBuilder.group({
      codigo: new FormControl(),
      seccionCodigo: new FormControl('', Validators.required),
      itemCodigo: new FormControl('', Validators.required),
      estado: new FormControl(),
    });
  }

  obtenerItemsPorSeccion(codigo: number) {
    this.itemService.obtenerItemPorSeccion(codigo).subscribe((data) => {
      this.listadoItemsPorSeccion = data;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  obtenerListadoSeccion() {
    this.seccionService.obtenerListadoSeccion().subscribe((data) => {
      this.listadoSeccion = data;
    });
  }

  generar(): void {
    let autorizacionItem: AutorizacionItem = new AutorizacionItem();
    autorizacionItem.codigo = this.formulario.get('codigo')!.value;
    autorizacionItem.autorizacionCodigo = this.autorizacion.codigo;
    autorizacionItem.itemCodigo = this.formulario.get('itemCodigo')!.value;
    autorizacionItem.estado = this.formulario.get('estado')!.value;
    if (!this.editar) {
      this.registrar(autorizacionItem);
    } else {
      this.actualizar(autorizacionItem);
    }
  }

  registrar(autorizacionItem: AutorizacionItem) {
    this.autorizacionItemService
      .insertarAutorizacionItem(autorizacionItem)
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

  actualizar(autorizacionItem: AutorizacionItem) {
    this.autorizacionItemService
      .actualizarAutorizacionItem(autorizacionItem)
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

  precargar(element: AutorizacionItem) {
    this.editar = true;
    this.formulario.get('codigo')!.setValue(element.codigo);
    this.formulario.get('seccionCodigo')!.setValue(element.seccionCodigo);
    this.obtenerItemsPorSeccion(element.seccionCodigo);
    this.formulario.get('itemCodigo')!.setValue(element.itemCodigo);
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
