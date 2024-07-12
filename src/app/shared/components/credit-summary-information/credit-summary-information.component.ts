import { Component, Input, OnInit } from '@angular/core';
import { CalcularCotizacionResumen } from '../../../core/models/cotizador-models';

@Component({
  selector: 'app-credit-summary-information',
  templateUrl: './credit-summary-information.component.html',
  styleUrl: './credit-summary-information.component.scss'
})
export class CreditSummaryInformationComponent implements OnInit {
  
  @Input() resumenCredito!: CalcularCotizacionResumen;

  ngOnInit(): void {
    
  }
}
