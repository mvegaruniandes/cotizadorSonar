import { CalcularCotizacionPlanPagos, CalcularCotizacionResumen, DocumentoPDF, PDFGenerado, Ramo, TipoDocumento } from "./cotizador-models";

export interface ResponseTipoDocumento {
    tiposDocumento: TipoDocumento[];
    idError: number;
    error: boolean;
    mensaje: string;
}

export interface ResponseProductos {
    ramos: Ramo[];
    idError: number;
    error: boolean;
    mensaje: string;
}

export interface ResponsePlazos {
    plazos: number[];
    idError: number;
    error: boolean;
    mensaje: string;
}

export interface ResponseCotizacion {
    calcularCotizacionResumenDTO: CalcularCotizacionResumen;
    calcularCotizacionPlanPagosDTO: CalcularCotizacionPlanPagos[];
    idError: number;
    error: boolean;
    mensaje: string;
}

export interface ResponseDescargaCotizacion {
    estado:  PDFGenerado;
    documento: DocumentoPDF;
}
