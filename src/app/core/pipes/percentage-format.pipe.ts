import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'percentageFormat' })
export class PercentageFormatPipe implements PipeTransform {
  transform(value: number): string {
    // Verificar si es un número válido
    if (isNaN(value)) return '';

    // Agregar el símbolo de porcentage al final
    return `${value}%`;
  }
}
