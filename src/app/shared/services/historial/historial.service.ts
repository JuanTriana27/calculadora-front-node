import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface HistorialItem {
    _id: string;
    tipo: string;
    expresion?: string;
    a?: number;
    b?: number;
    resultado: number;
    fecha: string;
    __v: number;
}

@Injectable({
    providedIn: 'root'
})
export class HistorialService {
    // Cambia esto según tu entorno
    private apiUrl = 'http://localhost:3000/api/historial';

    constructor(private http: HttpClient) { }

    // Método para obtener la URL (para depuración)
    getApiUrl(): string {
        return this.apiUrl;
    }

    getHistorial(): Observable<HistorialItem[]> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        console.log('Haciendo petición a:', this.apiUrl);

        return this.http.get<HistorialItem[]>(this.apiUrl, { headers }).pipe(
            tap(data => console.log('Respuesta recibida:', data)),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Error al cargar el historial';

        console.error('Error completo:', error);

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error del cliente: ${error.error.message}`;
        } else {
            // Error del servidor
            errorMessage = `Error ${error.status}: ${error.message}`;
            if (error.status === 0) {
                errorMessage = 'No se puede conectar con el servidor. Verifica que esté corriendo.';
            }
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}