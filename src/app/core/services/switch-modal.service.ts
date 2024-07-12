import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SwitchModalService {

  constructor() { }

  $modalPersonalize = new EventEmitter<any>();
  $modalAlert = new EventEmitter<any>();
}
