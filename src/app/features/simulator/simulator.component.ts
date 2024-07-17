import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CotizadorService } from '../../core/services/cotizador.service';
import { CalcularCotizacionPlanPagos, CalcularCotizacionResumen, calcularCotizacionVacia, ModalPersonalizacion, Ramo } from '../../core/models/cotizador-models';
import { ResponseCotizacion, ResponsePlazos, ResponseProductos } from '../../core/models/response';
import { StorageService } from '../../core/services/storage.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { SwitchModalService } from '../../core/services/switch-modal.service';

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

  cotizadorForm: FormGroup;
  pagoMayorForm: FormGroup;
  terminosPoliticaForm: FormGroup;

  ramos: Ramo[] = [];
  plazos: number[] = [];

  planPagos: CalcularCotizacionPlanPagos[] = [];
  resumenCredito: CalcularCotizacionResumen = calcularCotizacionVacia;

  datosModal: ModalPersonalizacion = {idSimulacion: 0, idFormulario: 0, titulo: '', tituloBoton: '' };

  constructor(private fb: FormBuilder,
    private spinner: SpinnerService,
    private cotizadorService: CotizadorService,
    private storageService: StorageService,
    private switchModalService: SwitchModalService) {
    this.cotizadorForm = this.fb.group({
      producto: ['', Validators.required],
      valorPoliza: ['', [Validators.required, this.amountValidator]],
      fechaInicioPoliza: ['', Validators.required],
      fechaLegalizacion: ['', Validators.required],
      beneficiario: ['', Validators.required],
      plazo: ['', Validators.required]
    });
    this.pagoMayorForm = this.fb.group({
      pago: ['false', Validators.required],
      valorPrimerPago: [''],
    });
    this.terminosPoliticaForm = this.fb.group({
      aceptoTerminos: [false, Validators.required],
      aceptoPolitica: [false, Validators.required],
    });
  }

  ngOnInit(): void {
    this.spinner.showSpinner();
    this.switchModalService.$modalPersonalize.subscribe((value) => {
      this.modalSwitchPersonalize = value;
    });
    this.switchModalService.$modalAlert.subscribe((value) => {
      this.modalSwitchAlert = value;
    });

    this.obtenerListadoRamos();
    this.spinner.hideSpinner();
  }

  //Función para validar el valor mínimo de la póliza
  amountValidator(control: any) {
    const value = parseInt(control.value.replace(/[^\d]/g, ''), 10);
    return value > 400000 ? null : { minAmount: true };
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
    if (this.cotizadorForm.valid && this.simulacionActiva == false) {
      this.spinner.showSpinner();

      //Validar recalculo
      const esMayorValorPago = valorMayorPago !== undefined;

      let data = {
        "idRamo": Number(this.cotizadorForm.value.producto),
        "idPlan": 1,
        "fechaInicioVigencia": this.cotizadorForm.value.fechaInicioPoliza,
        "fechaLegalizacion": this.cotizadorForm.value.fechaLegalizacion,
        "plazo": Number(this.cotizadorForm.value.plazo),
        "esBeneficiarioOneroso": Boolean(this.cotizadorForm.value.beneficiario),
        "esMayorValorPago": esMayorValorPago,
        "valorMayorPago": valorMayorPago ?? null,
        "valorPoliza": this.convertCurrencyStringToNumber(this.cotizadorForm.value.valorPoliza)
      }

      this.cotizadorService.calcularCotizacion(data).subscribe(
        (response: ResponseCotizacion) => {
          if (!response.error) {
            this.simulacionActiva = true; //Variable de control para mostrar la simulación
            this.planPagos = response.calcularCotizacionPlanPagosDTO;
            this.resumenCredito = response.calcularCotizacionResumenDTO;
          } else {
            this.mostrarMensajeError(response.mensaje);
          }
          this.spinner.hideSpinner();
        }
      );
    }
  }

  recalcularCotizacion(): void {
    const valorPago = this.pagoMayorForm.value.valorPrimerPago
    if (valorPago != '' && valorPago != undefined) {

      const valorMayorPago = this.convertCurrencyStringToNumber(valorPago);
      // Validar que el pago sea mayor a la primera cuota actual
      if (valorMayorPago > this.resumenCredito.valorPrimeraCuota) {
        this.simulacionActiva = false;
        this.calcularCotizacion(valorMayorPago);
      } else {
        const valorPrimeraCuotaActual = this.convertNumberToCurrencyString(this.resumenCredito.valorPrimeraCuota);
        this.mostrarMensajeError(`El valor del primer pago debe ser mayor a ${valorPrimeraCuotaActual}`);
      }

    } else {
      this.mostrarMensajeError("");
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
          } else {
            this.mostrarMensajeError(response.mensaje);
          }
        }
      );
    }
  }

  // Función para abrir modal de personalizar cotización
  abrirModalPersonalizacion(id: number): void {
    const terminos = this.terminosPoliticaForm.value.aceptoTerminos;
    const politicas = this.terminosPoliticaForm.value.aceptoPolitica;

    if (terminos && politicas) {
      switch (id) {
        case 1:
          this.datosModal = {
            idSimulacion: this.resumenCredito.idSimulacionCredito,
            idFormulario: id,
            titulo: 'Ingresa los datos personales del tomador de la póliza para descargar la Cotización',
            tituloBoton: 'Descargar'
          };
          break;
        case 2:
          this.datosModal = {
            idSimulacion: this.resumenCredito.idSimulacionCredito,
            idFormulario: id,
            titulo: 'Ingresa los datos personales del tomador de la póliza para enviar la Cotización',
            tituloBoton: 'Enviar'
          };
          break;
        case 3:
          this.datosModal = {
            idSimulacion: this.resumenCredito.idSimulacionCredito,
            idFormulario: id,
            titulo: 'Ingresa los datos del tomador de la póliza y continúa con el diligenciamiento del pagaré',
            tituloBoton: 'Continuar'
          };
          break;
        default:
          this.datosModal = {idSimulacion: this.resumenCredito.idSimulacionCredito, idFormulario: id, titulo: '', tituloBoton: '' };
          break;
      }

      this.switchModalService.$modalPersonalize.emit(true);
    } else {
      this.mostrarMensajeError('Debes aceptar los Términos y Condiciones de Uso y la Política de Tratamiento de Datos para continuar');
    }
  }

  habilitarBotonCalcular(): boolean {
    if (this.simulacionActiva || this.simulacionRecalculada) return true;
    return this.cotizadorForm.invalid && !this.simulacionActiva;
  }

  mostrarMensajeError(mensaje: string) {
    this.mensajeAlerta = mensaje;
    this.switchModalService.$modalAlert.emit(true);
  }
}
