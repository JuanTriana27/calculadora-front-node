import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface OperacionRequest {
    expresion: string;
}

export interface OperacionResponse {
    resultado: number;
    expresion?: string;
    tipo?: string;
    // Propiedades para uso local en el componente
    timestamp?: string;
    expresionMostrar?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CalculadoraService {
    private baseUrl = 'http://localhost:3000/api/calc';

    constructor(private http: HttpClient) { }

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