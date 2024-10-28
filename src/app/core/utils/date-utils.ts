import { differenceInDays, addDays } from "date-fns";

export class DateUtils {
    static parseDate(dateString: string): Date {
        const dateParts = dateString.split('-');
        const dateObject = new Date(
            parseInt(dateParts[0], 10),
            parseInt(dateParts[1], 10) - 1,
            parseInt(dateParts[2], 10),
            0, 0, 0
        );
        return dateObject;
    }

    static calcularDiferenciaDias(fecha1: Date, fecha2: Date) {
        //Convertir ambas fechas a solo fechas sin horas para evitar problemas de cálculo
        const fechaInicio = fecha1;
        const fechaFin = fecha2;

        const diferencia = Math.abs(differenceInDays(fechaFin, fechaInicio));
        return diferencia;
    }

    static getTodayStartOfDay(): Date {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    }

    static obtenerFechaMañanaHabil(festivos: string[]): string {
        let fecha = addDays(new Date(), 1);
        fecha = DateUtils.validarDiaHabil(fecha);

        if(DateUtils.validarFestivoFinDeSemana(festivos, DateUtils.formatDateToYYYYMMDD(fecha))){
            fecha = addDays(fecha, 1);
            fecha = DateUtils.validarDiaHabil(fecha);
        }

        let fechaString = DateUtils.formatDateToYYYYMMDD(fecha)
        return DateUtils.parseDate(fechaString).toISOString().substring(0, 10);
    }

    static validarDiaHabil(fecha: Date): Date {
        const dayOfWeek = fecha.getDay(); // 0 = Domingo, 6 = Sábado

        // Si es sábado (6), sumar 2 días para llegar al lunes
        if (dayOfWeek === 6) {
            fecha = addDays(fecha, 2);
        }
    
        // Si es domingo (0), sumar 1 día para llegar al lunes
        if (dayOfWeek === 0) {
            fecha = addDays(fecha, 1);
        }
        return fecha;
    }

    static validarFestivoFinDeSemana(festivos: string[], fecha: string) {
        let esFinDeSemana: boolean = false;
        const fechaAValidar = DateUtils.parseDate(fecha);

        esFinDeSemana = (fechaAValidar.getDay() === 0 || fechaAValidar.getDay() === 6);

        if (festivos.includes(DateUtils.formatDateToYYYYMMDD(fechaAValidar)) || esFinDeSemana) {
            return true;
        }

        return false;
    }

    static formatDateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}
