import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberFormat' })
export class NumberFormatPipe implements PipeTransform {
  transform(value: number): string {
    // Verificar si es un número válido
    if (isNaN(value)) return '';

    // Formatear el número con separadores de miles y sin decimales
    const formattedValue = value.toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&.');

    // Agregar el símbolo de dólar al principio
    return `$${formattedValue}`;
  }
}
