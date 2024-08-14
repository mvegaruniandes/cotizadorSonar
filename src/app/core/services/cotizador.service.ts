import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { StorageService } from './storage.service';
import { ResponseContinuarProceso, ResponseCotizacion, ResponseDescargaCotizacion, ResponseEnviarCotizacion, ResponseFestivos, ResponsePlazos, ResponseProductos, ResponseTipoDocumento } from '../models/response';


@Injectable({
  providedIn: 'root'
})
export class CotizadorService {
  //private apiUrl = 'https://dev.aplicaciones.crediestado.com.co/CotizadorCrediestadoBack/api/';
  private apiUrl = 'https://aplicaciones.crediestado.com.co/CotizadorCrediestadoBack/api/';
  //private apiUrl = 'https://localhost:7050/api/';

  constructor(private http: HttpClient, private storage: StorageService) { }

  // Servicio para obtener el listado de tipos de identificacion
  obtenerTiposDocumento(): Observable<any> {
    return this.http.get<ResponseTipoDocumento>(`${this.apiUrl}cotizador/obtenerTiposDocumento`).pipe(
      map(response => { return response }),
      catchError(this.handleError)  
    );
  }

  // Servicio para obtener el listado de festivos
  obtenerFestivos(): Observable<any> {
    return this.http.get<ResponseFestivos>(`${this.apiUrl}cotizador/obtenerFestivos`).pipe(
      map(response => { return response }),
      catchError(this.handleError)  
    );
  }

  // Servicio para obtener el listado de productos
  obtenerProductos(): Observable<any> {
    return this.http.get<ResponseProductos>(`${this.apiUrl}cotizador/obtenerProductos`).pipe(
      map(response => { return response }),
      catchError(this.handleError)   
    );
  }

  // Servicio para obtener plazos de la cotización
  obtenerPlazos(data: any): Observable<any> {
    return this.http.post<ResponsePlazos>(`${this.apiUrl}cotizador/obtenerPlazos`, data).pipe(
      map(response => { return response }),
      catchError(this.handleError)
    );
  }

  // Servicio para calcular la cotización
  calcularCotizacion(data: any): Observable<any> {
    return this.http.post<ResponseCotizacion>(`${this.apiUrl}cotizador/calcularCotizacion`, data).pipe(
      map(response => { return response }),
      catchError(this.handleError)
    );
  }

  // Servicio para recalcular la cotización
  recalcularCotizacion(data: any): Observable<any> {
    return this.http.post<ResponseCotizacion>(`${this.apiUrl}cotizador/recalcularCotizacion`, data).pipe(
      map(response => { return response }),
      catchError(this.handleError)
    );
  }

  // Enviar documento de cotización al correo
  enviarCotizacion(data: any): Observable<any> {
    return this.http.post<ResponseEnviarCotizacion>(`${this.apiUrl}general/enviarCorreo`, data).pipe(
      map(response => { return response }),
      catchError(this.handleError)
    );
  }

  // Descargar documento de cotización
  descargarCotizacion(data: any): Observable<any> {
    return this.http.post<ResponseDescargaCotizacion>(`${this.apiUrl}general/descargarCotizacion`, data).pipe(
      map(response => { return response }),
      catchError(this.handleError)
    );
  }

  // Continuar proceso de financiación
  continuarProceso(data: any): Observable<any> {
    return this.http.post<ResponseContinuarProceso>(`${this.apiUrl}general/continuarProceso`, data).pipe(
      map(response => { return response }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error, si el error persiste comunicate con el administrador.';

    if (error.status === 0) {
      console.error('An error occurred:', error.error);   
    } else if (error.status === 401) {
      errorMessage = "El tiempo para hacer tu proceso ha expirado.";
    }
    else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => errorMessage);
  }
}
