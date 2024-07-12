import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DatosTomador } from '../models/cotizador-models';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public datosTomador: DatosTomador;

  constructor(private storage: StorageService) {
    this.datosTomador = {
      idTipoDocumento: "1",
      numeroDocumento: '',
      nombreTomador: '',
      primerApellidoTomador: '',
      segundoApellidoTomador: '',
      correoTomador: ''
    };
  }

  setDatosTomador(value: DatosTomador) {
    const data = JSON.stringify(value);
    this.storage.saveData('DatosTomador', data);
  }

  getDatosTomador(): DatosTomador {
    const data = this.storage.getData('DatosTomador');
    this.datosTomador = JSON.parse(data);
    return this.datosTomador;
  }
}
