import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input-message-error',
  templateUrl: './input-message-error.component.html',
  styleUrl: './input-message-error.component.scss'
})
export class InputMessageErrorComponent {
  @Input() mensaje: string = 'Este campo es obligatorio.';
}
