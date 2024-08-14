import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CotizadorService } from '../../core/services/cotizador.service';
import { CalcularCotizacionPlanPagos, CalcularCotizacionResumen, calcularCotizacionVacia, ModalPersonalizacion, Ramo } from '../../core/models/cotizador-models';
import { ResponseCotizacion, ResponseFestivos, ResponsePlazos, ResponseProductos } from '../../core/models/response';
import { StorageService } from '../../core/services/storage.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { SwitchModalService } from '../../core/services/switch-modal.service';
import { FileService } from '../../core/services/file.service';
import { DateUtils } from '../../core/utils/date-utils';
import { add, addDays, addMonths } from 'date-fns';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrl: './simulator.component.scss'
})
export class SimulatorComponent implements OnInit {

  modalSwitchAlert: boolean = false;
  modalSwitchPersonalize: boolean = false;
  mensajeAlerta: string = '';
  simulacionActiva: boolean = false;
  simulacionRecalculada: boolean = false;

  isFormDisabled: boolean = false;

  cotizadorForm: FormGroup;
  pagoMayorForm: FormGroup;
  terminosPoliticaForm: FormGroup;

  festivos: string[] = [];
  ramos: Ramo[] = [];
  plazos: number[] = [];
  plazoMaximo: number = 11;

  planPagos: CalcularCotizacionPlanPagos[] = [];
  resumenCredito: CalcularCotizacionResumen = calcularCotizacionVacia;

  idSimulacionOriginal: number = 0;
  valorPrimerPagoSimulacionOriginal: number = 0;

  datosModal: ModalPersonalizacion = { idSimulacionOriginal: 0, idSimulacion: 0, idFormulario: 0, titulo: '', tituloBoton: '' };

  constructor(private fb: FormBuilder,
    private spinner: SpinnerService,
    private fileService: FileService,
    private cotizadorService: CotizadorService,
    private storageService: StorageService,
    private switchModalService: SwitchModalService) {
    this.cotizadorForm = this.fb.group({
      producto: [{ value: '', disabled: this.isFormDisabled }, Validators.required],
      valorPoliza: [{ value: '', disabled: this.isFormDisabled }, [Validators.required, this.amountValidator]],
      fechaInicioPoliza: [{ value: '', disabled: this.isFormDisabled }, Validators.required],
      fechaLegalizacion: [{ value: '', disabled: this.isFormDisabled }, Validators.required],
      beneficiario: [{ value: '', disabled: this.isFormDisabled }, Validators.required],
      plazo: [{ value: '', disabled: this.isFormDisabled }, Validators.required]
    });
    this.pagoMayorForm = this.fb.group({
      pago: ['false', Validators.required],
      valorPrimerPago: [''],
    });
    this.terminosPoliticaForm = this.fb.group({
      aceptoTerminosPolitica: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.spinner.showSpinner();
    this.storageService.clear();

    this.switchModalService.$modalPersonalize.subscribe((value) => {
      this.modalSwitchPersonalize = value;
    });
    this.switchModalService.$modalAlert.subscribe((value) => {
      this.modalSwitchAlert = value;
    });

    this.obtenerListadoRamos();
    this.obtenerListadoFestivos();

    this.spinner.hideSpinner();
  }

  //Función para validar el valor mínimo de la póliza
  amountValidator(control: any) {
    const value = parseInt(control.value.replace(/[^\d]/g, ''), 10);
    return value >= 400000 ? null : { minAmount: true };
  };

  //Función para parsear el valor de la póliza
  onInputChangeValorPoliza(event: any): void {
    let inputValue = event.target.value.replace(/[^\d]/g, '');
    if (inputValue) {
      inputValue = parseInt(inputValue, 10).toLocaleString('es-CO');
      this.cotizadorForm.get('valorPoliza')?.setValue('$' + inputValue, { emitEvent: false });
    } else {
      this.cotizadorForm.get('valorPoliza')?.setValue('', { emitEvent: false });
    }
  }

  //Función para parsear el valor mayor primera cuota
  onInputChangeValorMayorPrimeraCuota(event: any): void {
    let inputValue = event.target.value.replace(/[^\d]/g, '');
    if (inputValue) {
      inputValue = parseInt(inputValue, 10).toLocaleString('es-CO');
      this.pagoMayorForm.get('valorPrimerPago')?.setValue('$' + inputValue, { emitEvent: false });
    } else {
      this.pagoMayorForm.get('valorPrimerPago')?.setValue('', { emitEvent: false });
    }
  }

  // Método para aplicar formato de peso colombiano a la moneda
  formatCurrency(value: string): string {
    if (!value) return '';
    const numberValue = parseInt(value.replace(/[^\d]/g, ''), 10);
    return numberValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  }

  // Método para remover formato de peso colombiano a la moneda y retorna un número
  convertCurrencyStringToNumber(currencyString: string): number {
    const cleanedString = currencyString.replace(/[$.]/g, '');
    const numberValue = Number(cleanedString);
    return numberValue;
  }

  convertNumberToCurrencyString(number: number): string {
    let cleanedNumber = number.toLocaleString('es-CO');
    return '$' + cleanedNumber;
  }

  // Método para activar/desactivar validators de valor primer pago
  onRadioChangeValorPrimerPago(event: any): void {
    if (event.target.value == 'true') {
      this.pagoMayorForm.get('valorPrimerPago')?.setValidators([Validators.requiredTrue]);
      this.pagoMayorForm.get('valorPrimerPago')?.updateValueAndValidity();
    } else {
      this.pagoMayorForm.get('valorPrimerPago')?.setValue('');

      this.pagoMayorForm.get('valorPrimerPago')?.setValidators([]);
      this.pagoMayorForm.get('valorPrimerPago')?.updateValueAndValidity();
    }
  }

  // Método para recargar la página
  recargarPagina(): void {
    this.storageService.clear();
    window.location.reload();
  }

  // Función para calcular la cotización
  calcularCotizacion(valorMayorPago?: number): void {
    if (this.cotizadorForm.valid) {
      this.spinner.showSpinner();

      //Validar recalculo
      const esMayorValorPago = valorMayorPago !== undefined;

      let data = {
        "idRamo": Number(this.cotizadorForm.value.producto),
        "fechaInicioVigencia": this.cotizadorForm.value.fechaInicioPoliza,
        "fechaLegalizacion": this.cotizadorForm.value.fechaLegalizacion,
        "plazo": Number(this.cotizadorForm.value.plazo),
        "esBeneficiarioOneroso": this.cotizadorForm.value.beneficiario == "true" ? true : false,
        "esMayorValorPago": esMayorValorPago,
        "valorMayorPago": valorMayorPago ?? null,
        "valorPoliza": this.convertCurrencyStringToNumber(this.cotizadorForm.value.valorPoliza)
      }

      this.cotizadorService.calcularCotizacion(data).subscribe(
        (response: ResponseCotizacion) => {
          if (!response.error) {
            this.setFormState(true); //Método de control para mostrar la simulación
            this.planPagos = response.calcularCotizacionPlanPagosDTO;
            this.resumenCredito = response.calcularCotizacionResumenDTO;

            if (!esMayorValorPago) {
              this.valorPrimerPagoSimulacionOriginal = this.resumenCredito.valorPrimeraCuota;
              this.idSimulacionOriginal = this.resumenCredito.idSimulacionCredito;
            }

          } else {
            this.mostrarMensajeError(response.mensaje);
          }
          this.spinner.hideSpinner();
        }
      );
    } else {
      this.triggerValidation(this.cotizadorForm);
      this.mostrarMensajeError("¡Ups! Recuerda completar todos los campos para realizar la cotización.");
    }
  }

  recalcularCotizacion(): void {
    const valorPago = this.pagoMayorForm.value.valorPrimerPago
    if (valorPago != '' && valorPago != undefined) {

      const valorMayorPago = this.convertCurrencyStringToNumber(valorPago);
      // Validar que el pago sea mayor a la primera cuota actual
      if (valorMayorPago >= this.valorPrimerPagoSimulacionOriginal) { //
        this.setFormState(false); //Método de control para mostrar la simulación
        this.calcularCotizacion(valorMayorPago);
      } else {
        const valorPrimeraCuotaActual = this.convertNumberToCurrencyString(this.valorPrimerPagoSimulacionOriginal);
        this.mostrarMensajeError(`El valor del primer pago debe ser mayor a ${valorPrimeraCuotaActual}.`);
      }

    } else {
      this.mostrarMensajeError("Ingresa un valor en mayor pago para recalculcar la cotización.");
    }
  }

  obtenerListadoRamos(): void {
    this.cotizadorService.obtenerProductos().subscribe(
      (response: ResponseProductos) => {
        if (!response.error) {
          this.ramos = response.ramos;
        } else {
          this.mostrarMensajeError(response.mensaje);
        }
      }
    )
  }

  obtenerListadoFestivos(): void {
    this.cotizadorService.obtenerFestivos().subscribe(
      (response: ResponseFestivos) => {
        if (!response.error) {
          this.festivos = response.festivos;
          this.cotizadorForm.get('fechaLegalizacion')?.setValue(DateUtils.obtenerFechaMañanaHabil(this.festivos));
        } else {
          this.mostrarMensajeError(response.mensaje);
        }
      }
    )
  }

  validarFechasInicioPolizaIngresoCotizador() {
    const fechaInicioPoliza = this.cotizadorForm.value.fechaInicioPoliza;

    const diferencia = DateUtils.calcularDiferenciaDias(
      DateUtils.getTodayStartOfDay(),
      DateUtils.parseDate(fechaInicioPoliza));

    if (diferencia > 17 && this.cotizadorForm.value.producto == 2) {
      this.mostrarMensajeError('El máximo de días entre la fecha de inicio de póliza y fecha de ingreso no puede ser mayor a 17 días.');
      this.cotizadorForm.get('fechaInicioPoliza')?.setValue('');
      return;
    }

    if (DateUtils.parseDate(fechaInicioPoliza) <= DateUtils.parseDate(DateUtils.formatDateToYYYYMMDD(addMonths(new Date(), -3)))) {
      this.mostrarMensajeError('Una póliza con más de 3 meses de expedida no es objeto de financiación.');
      this.cotizadorForm.get('fechaInicioPoliza')?.setValue('');
      return;
    }

    if (diferencia > 30 && diferencia <= 90) {
      this.mostrarMensajeError('Favor comuníquese con su asesor comercial.');
    }

    if (diferencia > 90) {
      this.mostrarMensajeError('El máximo de días entre la fecha de inicio de póliza y fecha de legalización no puede ser mayor a 90 días.');
    }

    // if(DateUtils.validarFestivoFinDeSemana(this.festivos, fechaInicioPoliza)){
    //   this.mostrarMensajeError('La Fecha Inicio de Vigencia ingresada corresponde a un día no hábil, ingresa una nueva fecha.');
    //   this.cotizadorForm.get('fechaInicioPoliza')?.setValue('');
    //   return;
    // }

    if (this.cotizadorForm.value.fechaLegalizacion != '') {
      this.validarFechasInicioPolizaLegalizacion();
    }
  }

  validarFechasInicioPolizaLegalizacion() {
    const fechaInicioPoliza = this.cotizadorForm.value.fechaInicioPoliza;
    const fechaLegalizacion = this.cotizadorForm.value.fechaLegalizacion;

    const diferencia = DateUtils.calcularDiferenciaDias(
      DateUtils.parseDate(fechaInicioPoliza),
      DateUtils.parseDate(fechaLegalizacion)
    );

    // if (diferencia > 30 && diferencia <= 90) {
    //   this.mostrarMensajeError('Favor comuníquese con su asesor comercial.');
    // }

    // if (diferencia > 90) {
    //   this.mostrarMensajeError('El máximo de días entre la fecha de inicio de póliza y fecha de desembolso no puede ser mayor a 90 días.');
    // }

    // if (diferencia > 17 && this.cotizadorForm.value.producto == 2) {
    //   this.mostrarMensajeError('El máximo de días entre la fecha de inicio de póliza y fecha de desembolso no puede ser mayor a 17 días.');
    //   this.cotizadorForm.get('fechaLegalizacion')?.setValue('');
    //   return;
    // }

    // if (DateUtils.validarFestivoFinDeSemana(this.festivos, fechaLegalizacion)) {
    //   this.mostrarMensajeError('La Fecha de Desembolso ingresada corresponde a un día no hábil, ingresa una nueva fecha.');
    //   this.cotizadorForm.get('fechaLegalizacion')?.setValue('');
    //   return;
    // }

    this.calcularPlazos();
  }

  calcularPlazos(): void {
    this.cotizadorForm.get('plazos')?.setValue('');
    this.plazos = [];

    const fechaInicioPoliza = this.cotizadorForm.value.fechaInicioPoliza;
    const fechaLegalizacion = this.cotizadorForm.value.fechaLegalizacion;

    if (fechaInicioPoliza !== '' && fechaLegalizacion !== '') {
      let data: any = {
        'fechaInicioVigencia': fechaInicioPoliza,
        'fechaLegalizacion': fechaLegalizacion,
      }

      this.cotizadorService.obtenerPlazos(data).subscribe(
        (response: ResponsePlazos) => {
          if (!response.error) {
            this.plazos = response.plazos;
            this.plazoMaximo = this.plazos[this.plazos.length - 1]
          } else {
            if (response.idError == 1) {
              this.cotizadorForm.get('fechaInicioPoliza')?.setValue('');
            }
            this.mostrarMensajeError(response.mensaje);
          }
        }
      );
    }
  }

  // Función para abrir modal de personalizar cotización
  abrirModalPersonalizacion(id: number): void {
    const terminosPolitica = this.terminosPoliticaForm.value.aceptoTerminosPolitica;

    if (terminosPolitica) {
      switch (id) {
        case 1:
          this.datosModal = {
            idSimulacionOriginal: this.idSimulacionOriginal,
            idSimulacion: this.resumenCredito.idSimulacionCredito,
            idFormulario: id,
            titulo: 'Ingresa los datos personales del tomador de la póliza para descargar la Cotización',
            tituloBoton: 'Descargar'
          };
          break;
        case 2:
          this.datosModal = {
            idSimulacionOriginal: this.idSimulacionOriginal,
            idSimulacion: this.resumenCredito.idSimulacionCredito,
            idFormulario: id,
            titulo: 'Ingresa los datos personales del tomador de la póliza para enviar la Cotización',
            tituloBoton: 'Enviar'
          };
          break;
        case 3:
          this.datosModal = {
            idSimulacionOriginal: this.idSimulacionOriginal,
            idSimulacion: this.resumenCredito.idSimulacionCredito,
            idFormulario: id,
            titulo: 'Ingresa los datos del tomador de la póliza y continúa con el diligenciamiento del pagaré',
            tituloBoton: 'Continuar'
          };
          break;
        default:
          this.datosModal = {
            idSimulacionOriginal: this.idSimulacionOriginal,
            idSimulacion: this.resumenCredito.idSimulacionCredito,
            idFormulario: id,
            titulo: '',
            tituloBoton: ''
          };
          break;
      }

      this.switchModalService.$modalPersonalize.emit(true);
    } else {
      this.mostrarMensajeError('Debes aceptar los Términos y Condiciones de Uso y la Política de Tratamiento de Datos para continuar.');
    }
  }

  mostrarMensajeError(mensaje: string) {
    this.mensajeAlerta = mensaje;
    this.switchModalService.$modalAlert.emit(true);
  }

  private setFormState(isDisabled: boolean) {
    this.simulacionActiva = true;
    // if (isDisabled) {
    //   this.cotizadorForm.disable();
    // } else {
    //   this.cotizadorForm.enable();
    // }
  }

  descargarDocumento(ruta: string, nombre: string) {
    this.fileService.downloadFile(ruta, nombre);
  }

  triggerValidation(form: FormGroup) {
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
