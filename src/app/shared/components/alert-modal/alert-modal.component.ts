import { Component, Input, OnInit } from '@angular/core';
import { SwitchModalService } from '../../../core/services/switch-modal.service';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.scss'
})
export class AlertModalComponent implements OnInit {

  @Input() mensaje: string = '';
  
  constructor(private switchModalService: SwitchModalService){

  }
  
  ngOnInit(): void {

  }

  // Función para cerrar la modal
  cerrarModal() {
    this.switchModalService.$modalAlert.emit(false);
  }
}
