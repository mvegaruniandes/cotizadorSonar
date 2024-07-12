import { Component, Input, OnInit } from '@angular/core';
import { CalcularCotizacionPlanPagos } from '../../../core/models/cotizador-models';

@Component({
  selector: 'app-simulation-datatable',
  templateUrl: './simulation-datatable.component.html',
  styleUrl: './simulation-datatable.component.scss'
})
export class SimulationDatatableComponent implements OnInit {

  @Input() planPagos: CalcularCotizacionPlanPagos[] = [];

  ngOnInit() {
    
  }
}
