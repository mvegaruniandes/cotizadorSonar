export interface TipoDocumento {
    id: number,
    nombre: string
}

export interface Ramo {
    id: number,
    nombre: string
}

export interface DatosTomador {
    idTipoDocumento: string,
    numeroDocumento: string,
    nombreTomador: string,
    primerApellidoTomador: string,
    segundoApellidoTomador: string,
    correoTomador: string
}

export interface ModalPersonalizacion {
    idSimulacion: number,
    idFormulario: number,
    titulo: string,
    tituloBoton: String
}

export interface CalcularCotizacionPlanPagos {
    numeroDeCuota: number;
    fechaPagoCuota: Date;
    valorCuota: number;
    valorIntereses: number;
    valorCapital: number;
    valorSaldoCapital: number;
}

export interface CalcularCotizacionResumen {
    fechaProcesoCotizacion: Date;
    tasaEfectivoAnual: number;
    tasaMesVencido: number;
    valorFinanciacion: number;
    valorPrimeraCuota: number;
    valorCuotasRestantes: number;
    cuotasRestantes: number;
    fechaValidezCotizacion: Date;
    fechaVigenciaTasa: Date;
    fechaInicioVigencia: Date;
    fechaFinVigencia: Date;
    fechaLegalizacion: Date;
    idPlan: number;
    idRamo: number;
    idSimulacionCredito: number;
    plazo: number;
    esBenficiarioOneroso: boolean;
    esMayorValorPago: boolean;
}

export const calcularCotizacionVacia: CalcularCotizacionResumen = {
    fechaProcesoCotizacion: new Date(),
    tasaEfectivoAnual: 0,
    tasaMesVencido: 0,
    valorFinanciacion: 0,
    valorPrimeraCuota: 0,
    valorCuotasRestantes: 0,
    cuotasRestantes: 0,
    fechaValidezCotizacion: new Date(),
    fechaVigenciaTasa: new Date(),
    fechaInicioVigencia: new Date(),
    fechaFinVigencia: new Date(),
    fechaLegalizacion: new Date(),
    idPlan: 0,
    idRamo: 0,
    idSimulacionCredito: 0,
    plazo: 0,
    esBenficiarioOneroso: false,
    esMayorValorPago: false
};

export interface DocumentoPDF {
    fileContents: string;
    contentType: string;
    fileDownloadName: string;
    lastModified: Date | null;
    entityTag: string | null;
    enableRangeProcessing: boolean;
}

export interface PDFGenerado {
    documento: null;
    nombreDocumento: string;
    idError: number;
    error: boolean;
    mensaje: string;
}