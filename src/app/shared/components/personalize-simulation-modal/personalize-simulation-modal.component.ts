import { Component, Input } from '@angular/core';
import { SharedService } from '../../../core/services/shared.service';
import { SwitchModalService } from '../../../core/services/switch-modal.service';
import { DatosTomador, ModalPersonalizacion, TipoDocumento } from '../../../core/models/cotizador-models';
import { CotizadorService } from '../../../core/services/cotizador.service';
import { ResponseDescargaCotizacion, ResponseTipoDocumento } from '../../../core/models/response';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpinnerService } from '../../../core/services/spinner.service';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-personalize-simulation-modal',
  templateUrl: './personalize-simulation-modal.component.html',
  styleUrl: './personalize-simulation-modal.component.scss'
})
export class PersonalizeSimulationModalComponent {
  @Input() datos!: ModalPersonalizacion;

  tiposDocumento: TipoDocumento[] = [];
  tomadorForm: FormGroup;

  constructor(private fb: FormBuilder,
    private sharedService: SharedService,
    private fileService: FileService,
    private spinner: SpinnerService,
    private cotizadorService: CotizadorService,
    private switchModalService: SwitchModalService) {
    this.tomadorForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroIdentificacion: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      nombreTomador: ['', Validators.required],
      primerApellidoTomador: ['', Validators.required],
      segundoApellidoTomador: [''],
      correoTomador: ['', [Validators.email]],
    });
  }

  ngOnInit(): void {
    this.precargarInfoTomador();
    this.obtenerListadoTiposDocumento();
  }

  obtenerListadoTiposDocumento(): void {
    this.cotizadorService.obtenerTiposDocumento().subscribe(
      (response: ResponseTipoDocumento) => {
        if (!response.error) {
          this.tiposDocumento = response.tiposDocumento;
        } else {
          this.mostrarMensajeError(response.mensaje);
        }
      }
    )
  }

  //Función para parsear el valor mayor primera cuota
  onInputChangeNumeroIdentificacion(event: any): void {
    let inputValue = event.target.value.replace(/[^\d]/g, '');
    if (inputValue) {
      this.tomadorForm.get('numeroIdentificacion')?.setValue(inputValue, { emitEvent: false });
    } else {
      this.tomadorForm.get('numeroIdentificacion')?.setValue('', { emitEvent: false });
    }
  }

  //Función para enviar formulario
  onSubmit() {
    if (this.tomadorForm.valid) {
      this.spinner.showSpinner();
      this.guardarInfoTomador();

      let data = {
        'idSimulacionCredito': 1,
        'idTipoDocumento': this.tomadorForm.value.tipoDocumento,
        'numeroDocumento': this.tomadorForm.value.numeroIdentificacion,
        'nombres': this.tomadorForm.value.nombreTomador,
        'primerApellido': this.tomadorForm.value.primerApellidoTomador,
        'segundoApellido': this.tomadorForm.value.segundoApellidoTomador,
        'email': this.tomadorForm.value.correoTomador
      };

      if (this.datos.idFormulario == 1) {
        this.descargarCotizacion(data);
      } else if (this.datos.idFormulario == 2) {
        this.enviarCotizacion();
      } else {

      }

      this.spinner.hideSpinner();
      this.cerrarModal();
    }
  }

  // Servicio para descargar la cotización del cliente
  descargarCotizacion(data: any) {
    this.cotizadorService.descargarCotizacion(data).subscribe(
      (response: ResponseDescargaCotizacion) => {
        if (!response.estado.error) {
          const blob = this.fileService.base64ToBlob(response.documento.fileContents, response.documento.contentType);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.documento.fileDownloadName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
        else {
          this.mostrarMensajeError(response.estado.mensaje);
        }
      }
    );
  }

  // Servicio para enviar la cotización del cliente
  enviarCotizacion() {

  }

  // Función para precargar datos
  precargarInfoTomador() {
    let infoTomador: DatosTomador = this.sharedService.getDatosTomador();
    if (infoTomador != undefined && infoTomador != null) {
      this.tomadorForm.get('tipoDocumento')?.setValue(infoTomador.idTipoDocumento);
      this.tomadorForm.get('numeroIdentificacion')?.setValue(infoTomador.numeroDocumento);
      this.tomadorForm.get('nombreTomador')?.setValue(infoTomador.nombreTomador);
      this.tomadorForm.get('primerApellidoTomador')?.setValue(infoTomador.primerApellidoTomador);
      this.tomadorForm.get('segundoApellidoTomador')?.setValue(infoTomador.segundoApellidoTomador);
      this.tomadorForm.get('correoTomador')?.setValue(infoTomador.correoTomador);
    }
  }

  // Función para guardar información del tomador
  guardarInfoTomador() {
    this.sharedService.setDatosTomador({
      idTipoDocumento: this.tomadorForm.value.tipoDocumento,
      numeroDocumento: this.tomadorForm.value.numeroIdentificacion,
      nombreTomador: this.tomadorForm.value.nombreTomador,
      primerApellidoTomador: this.tomadorForm.value.primerApellidoTomador,
      segundoApellidoTomador: this.tomadorForm.value.segundoApellidoTomador,
      correoTomador: this.tomadorForm.value.correoTomador,
    });
  }

  // Función para cerrar la modal
  cerrarModal() {
    this.switchModalService.$modalPersonalize.emit(false);
  }

  mostrarMensajeError(mensaje: string) {
  }
}
