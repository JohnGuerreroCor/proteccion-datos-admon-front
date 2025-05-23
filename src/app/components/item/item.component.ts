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
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Normativa } from 'src/app/models/normativa';
import { Seccion } from 'src/app/models/seccion';
import { SeccionService } from 'src/app/services/seccion.service';
import { Item } from 'src/app/models/item';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
})
export class ItemComponent implements OnInit {
  step = 0;
  claves!: string;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto' as FloatLabelType);
  dataSource = new MatTableDataSource<Item>([]);
  displayedColumns: string[] = ['index', 'seccion', 'contenido', 'opciones'];
  listadoItem: Item[] = [];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    public seccionService: SeccionService,
    public itemService: ItemService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerSeccion();
  }

  obtenerSeccion() {
    this.itemService.obtenerListadoItem().subscribe((data) => {
      this.listadoItem = data;
      this.dataSource = new MatTableDataSource<Item>(data);
      this.paginator.firstPage();
      this.dataSource.paginator = this.paginator;
    });
  }

  restaurar() {
    this.obtenerSeccion();
    this.claves = '';
  }

  registrarFormulario(): void {
    this.dialogRef = this.dialog.open(ModalItemFormulario, {
      width: '80%',
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
    this.dialogRef = this.dialog.open(ModalItemFormulario, {
      width: '80%',
      disableClose: true,
      data: { item: element },
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
  selector: 'modal-item-formulario',
  templateUrl: 'modal-item-formulario.html',
  styleUrls: ['./item.component.css'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
  ],
})
export class ModalItemFormulario {
  editar: boolean = false;
  formulario!: FormGroup;
  listadoSeccion: Seccion[] = [];
  htmlContent = '';

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    minHeight: '5rem',
    placeholder: 'Copie o digite el contenido del documento aquí.',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      [
        'strikeThrough',
        'subscript',
        'superscript',
        'indent',
        'justifyRight',
        'outdent',
        'heading',
        'textColor',
        'backgroundColor',
        'customClasses',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode',
      ],
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  constructor(
    public dialogRef: MatDialogRef<ModalItemFormulario>,
    private formBuilder: FormBuilder,
    public seccionService: SeccionService,
    public itemService: ItemService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.authService.validacionToken()) {
      this.crearFormulario();
      this.obtenerListadoSeccionTipo();
      if (JSON.stringify(data) !== 'null') {
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
      contenido: new FormControl('', Validators.required),
      seccionCodigo: new FormControl('', Validators.required),
      estado: new FormControl(),
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  obtenerListadoSeccionTipo() {
    this.seccionService.obtenerListadoSeccion().subscribe((data) => {
      this.listadoSeccion = data;
    });
  }

  generar(): void {
    let item: Item = new Item();
    item.codigo = this.formulario.get('codigo')!.value;
    item.contenido = this.formulario.get('contenido')!.value;
    item.seccionCodigo = this.formulario.get('seccionCodigo')!.value;
    item.estado = this.formulario.get('estado')!.value;
    if (!this.editar) {
      this.registrar(item);
    } else {
      this.actualizar(item);
    }
  }

  registrar(item: Item) {
    this.itemService.insertarItem(item).subscribe(
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

  actualizar(item: Item) {
    this.itemService.actualizarItem(item).subscribe(
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

  precargar(element: Item) {
    this.editar = true;
    this.formulario.get('codigo')!.setValue(element.codigo);
    this.formulario.get('contenido')!.setValue(element.contenido);
    this.formulario.get('seccionCodigo')!.setValue(element.seccionCodigo);
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
