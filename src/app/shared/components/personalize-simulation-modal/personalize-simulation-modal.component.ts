import { Component, inject, Input } from '@angular/core';
import { SharedService } from '../../../core/services/shared.service';
import { SwitchModalService } from '../../../core/services/switch-modal.service';
import { DatosTomador, ModalPersonalizacion, TipoDocumento } from '../../../core/models/cotizador-models';
import { CotizadorService } from '../../../core/services/cotizador.service';
import { ResponseContinuarProceso, ResponseDescargaCotizacion, ResponseEnviarCotizacion, ResponseTipoDocumento } from '../../../core/models/response';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpinnerService } from '../../../core/services/spinner.service';
import { FileService } from '../../../core/services/file.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-personalize-simulation-modal',
  templateUrl: './personalize-simulation-modal.component.html',
  styleUrl: './personalize-simulation-modal.component.scss'
})
export class PersonalizeSimulationModalComponent {
  @Input() datos!: ModalPersonalizacion;

  tiposDocumento: TipoDocumento[] = [];
  tomadorForm: FormGroup;

  ocultarCorreo: boolean = true;

  labelPrimerApellido: string = 'Nombre del tomador';
  placeholderPrimerApellido: string = 'Ingresa el nombre tomador';
  esPersonaJuridica: boolean = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    private toast: NgToastService,
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
      correoTomador: [''],
    });
  }

  ngOnInit(): void {
    this.configurarValidadorCorreo();
    this.obtenerListadoTiposDocumento();
    this.precargarInfoTomador();
  }

  obtenerListadoTiposDocumento(): void {
    this.cotizadorService.obtenerTiposDocumento().subscribe(
      (response: ResponseTipoDocumento) => {
        if (!response.error) {
          this.tiposDocumento = response.tiposDocumento;
          this.onChangeTipoDocumento();
        } else {
          this.mostrarMensajeError(response.mensaje);
        }
      }
    )
  }

  onChangeTipoDocumento() {
    this.tomadorForm.get('tipoDocumento')?.valueChanges.subscribe(value => {
      this.validarTipoPersona(value);
    });
  }

  validarTipoPersona(value: any) {
    const primerApellidoTomadorControl = this.tomadorForm.get('primerApellidoTomador');
    const segundoApellidoTomadorControl = this.tomadorForm.get('segundoApellidoTomador');

    if (value == 2) {
      this.labelPrimerApellido = 'Razón social';
      this.placeholderPrimerApellido = 'Ingresa la razón social';
      this.esPersonaJuridica = true;

      primerApellidoTomadorControl?.setValue('');
      segundoApellidoTomadorControl?.setValue('');
      primerApellidoTomadorControl?.clearValidators();
    } else {
      this.labelPrimerApellido = 'Nombre del tomador';
      this.placeholderPrimerApellido = 'Ingresa el nombre tomador';
      this.esPersonaJuridica = false;

      primerApellidoTomadorControl?.setValidators(Validators.required);
    }

    this.validacionTipoDocumentoXPersona(value);
    primerApellidoTomadorControl?.updateValueAndValidity();
  }

  validacionTipoDocumentoXPersona(value: any) {
    const numeroIdentificacionControl = this.tomadorForm.get('numeroIdentificacion');
    numeroIdentificacionControl?.clearValidators();

    if (value == 2) {
      numeroIdentificacionControl?.setValidators(
        [Validators.required, Validators.pattern(/^\d{1,10}-\d$/)]
      );
    } else {
      numeroIdentificacionControl?.setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$')]
      );
    }
    numeroIdentificacionControl?.updateValueAndValidity();
  }

  onInputChangeNumeroIdentificacion(event: any): void {
    let inputValue = event.target.value.replace(/[^\d]/g, '');

    if (this.esPersonaJuridica) {
      inputValue = event.target.value.replace(/[^\d-]/g, '');
    }

    if (inputValue) {
      this.tomadorForm.get('numeroIdentificacion')?.setValue(inputValue, { emitEvent: false });
    } else {
      this.tomadorForm.get('numeroIdentificacion')?.setValue('', { emitEvent: false });
    }
  }

  //Función para enviar formulario
  onSubmit() {
    if (this.tomadorForm.valid) {
      this.guardarInfoTomador();
      this.cerrarModal();

      this.spinner.showSpinner();

      let data = {
        'idSimulacionOriginal': this.datos.idSimulacionOriginal,
        'idSimulacionCredito': this.datos.idSimulacion,
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
        this.enviarCotizacion(data);
      } else {
        this.continuarProceso(data);
      }

      this.spinner.hideSpinner();
    } else {
      this.tomadorForm.markAllAsTouched();
      this.mostrarMensajeError('Campos pendientes de diligenciamiento.');
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
  enviarCotizacion(data: any) {
    this.cotizadorService.enviarCotizacion(data).subscribe(
      (response: ResponseEnviarCotizacion) => {
        if (!response.error) {
          this.mostrarMensaje(response.mensaje);
        } else {
          this.mostrarMensajeError(response.mensaje);
        }
      }
    );
  }

  // Servicio para continuar al proceso de financiación
  continuarProceso(data: any) {
    this.cotizadorService.continuarProceso(data).subscribe(
      (response: ResponseContinuarProceso) => {
        if (!response.error) {
          window.location.href = response.urlProceso;
        } else {
          this.mostrarMensajeError(response.mensaje);
        }
      }
    );
  }

  // Función para habilitar o inhabilitar validador de correo electrónico
  configurarValidadorCorreo() {
    if (this.datos.idFormulario == 2) {
      this.ocultarCorreo = false;
      const correoControl = this.tomadorForm.get('correoTomador');

      correoControl?.setValidators([Validators.required, Validators.email]);
      correoControl?.updateValueAndValidity();
    }
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
      this.validarTipoPersona(infoTomador.idTipoDocumento);
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
    this.guardarInfoTomador();
    this.switchModalService.$modalPersonalize.emit(false);
  }

  mostrarMensajeError(mensaje: string) {
    this.toast.danger(mensaje);
  }

  mostrarMensaje(mensaje: string) {
    this.toast.success(mensaje);
  }
}
