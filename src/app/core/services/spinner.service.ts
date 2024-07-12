import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  constructor(private spinnerService: NgxSpinnerService) { }

  //Método para mostrar el loading spinner
  showSpinner() {
    this.spinnerService.show();
  }

  //Método para ocultar el loading spinner
  hideSpinner() {
    this.spinnerService.hide();
  }

}
