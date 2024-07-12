import { Inject, PLATFORM_ID, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // Guarda datos en el localStorage cifrando la información
  saveData(key: string, data: any): void {
      localStorage.setItem(key, data);
  }

  // Obtiene datos del localStorage descifrando la información
  getData(key: string): any {
      return localStorage.getItem(key); 
  }

  // Elimina datos del localStorage
  removeData(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  // Limpiar todo el localStorage
  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }
}
