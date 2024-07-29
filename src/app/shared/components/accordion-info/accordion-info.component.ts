import { Component } from '@angular/core';

@Component({
  selector: 'app-accordion-info',
  templateUrl: './accordion-info.component.html',
  styleUrl: './accordion-info.component.scss'
})
export class AccordionInfoComponent {
  isOpen = true;

  togglePanel() {
    //this.isOpen = !this.isOpen;
  }
}
