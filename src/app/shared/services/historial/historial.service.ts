import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
    // private apiUrl = 'https://calcnodeback.onrender.com/api/historial';
    private apiUrl = `${environment.apiUrl}/historial`;

    constructor(private http: HttpClient) {
        console.log('HistorialService - Environment production:', environment.production);
        console.log('HistorialService - Environment API URL:', environment.apiUrl);
        console.log('HistorialService - URL final:', this.apiUrl);
    }

    getApiUrl(): string {
        return this.apiUrl;
    }

    getHistorial(): Observable<HistorialItem[]> {
        console.log('🔍 getHistorial() llamado. URL:', this.apiUrl);

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        console.log('📤 Haciendo petición GET a:', this.apiUrl);

        return this.http.get<HistorialItem[]>(this.apiUrl).pipe(
            tap(data => {
                console.log('✅ Respuesta recibida del historial:', data);
                console.log('✅ Cantidad de registros:', data.length);
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('❌ HistorialService - Error completo:', error);
        console.error('❌ Error URL:', error.url);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error name:', error.name);

        let errorMessage = 'Error al cargar el historial';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error del cliente: ${error.error.message}`;
        } else {
            if (error.status === 0) {
                errorMessage = 'No se puede conectar con el servidor. Verifica que esté corriendo.';
            } else {
                errorMessage = `Error ${error.status}: ${error.message}`;
            }
        }

        console.error('❌ ErrorMessage final:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}