import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface OperacionRequest {
    expresion: string;
}

export interface OperacionResponse {
    resultado: number;
    expresion?: string;
    tipo?: string;
    timestamp?: string;
    expresionMostrar?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CalculadoraService {
    private baseUrl = 'https://calcnodeback.onrender.com/api/calc';
    //private baseUrl = `${environment.apiUrl}/calc`;

    constructor(private http: HttpClient) {
        console.log('Environment production:', environment.production);
        console.log('API URL:', environment.apiUrl);
    }

    // ... el resto de tu código permanece igual
    operar(expresion: string): Observable<OperacionResponse> {
        const body: OperacionRequest = { expresion };
        return this.http.post<OperacionResponse>(`${this.baseUrl}/operar`, body)
            .pipe(
                catchError(this.handleError)
            );
    }

    sumar(a: number, b: number): Observable<OperacionResponse> {
        return this.http.post<OperacionResponse>(`${this.baseUrl}/sumar`, { a, b })
            .pipe(
                catchError(this.handleError)
            );
    }

    restar(a: number, b: number): Observable<OperacionResponse> {
        return this.http.post<OperacionResponse>(`${this.baseUrl}/restar`, { a, b })
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Error en la operación';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            if (error.status === 400) {
                errorMessage = 'Expresión matemática inválida';
            } else {
                errorMessage = `Error ${error.status}: ${error.message}`;
            }
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}