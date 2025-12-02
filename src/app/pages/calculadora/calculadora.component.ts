import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalculadoraService, OperacionResponse } from '../../shared/services/calculadora/calculadora.service';
import { Subscription } from 'rxjs';

interface HistorialItemLocal extends OperacionResponse {
    timestamp: string;
    expresionMostrar: string;
}

@Component({
    selector: 'app-calculadora',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './calculadora.component.html',
    styleUrls: ['./calculadora.component.scss']
})
export class CalculadoraComponent implements OnInit, OnDestroy {
    display = '0';
    expression = '';
    lastResult: number | null = null;
    isCalculating = false;
    errorMessage: string | null = null;
    historial: HistorialItemLocal[] = [];

    private subscription: Subscription | null = null;

    constructor(private calculadoraService: CalculadoraService) { }

    ngOnInit(): void {
        this.loadHistorialLocal();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const key = event.key;

        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '.', 'Enter', 'Escape', 'Backspace', 'Delete'].includes(key)) {
            event.preventDefault();
        }

        switch (key) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.appendNumber(key);
                break;
            case '+':
                this.appendOperator('+');
                break;
            case '-':
                this.appendOperator('-');
                break;
            case '*':
                this.appendOperator('×');
                break;
            case '/':
                this.appendOperator('÷');
                break;
            case '.':
                this.appendDecimal();
                break;
            case 'Enter':
            case '=':
                this.calculate();
                break;
            case 'Escape':
            case 'Delete':
                this.clear();
                break;
            case 'Backspace':
                this.deleteLast();
                break;
            case 'c':
            case 'C':
                if (event.ctrlKey) this.clear();
                break;
        }
    }

    appendNumber(num: string): void {
        if (this.display === '0' || this.display === 'Error') {
            this.display = num;
        } else {
            this.display += num;
        }
        this.expression = this.display;
        this.errorMessage = null;
    }

    appendOperator(operator: string): void {
        const lastChar = this.display.slice(-1);
        const operators = ['+', '-', '×', '÷'];

        if (operators.includes(lastChar)) {
            this.display = this.display.slice(0, -1) + operator;
        } else {
            this.display += operator;
        }
        this.expression = this.display;
        this.errorMessage = null;
    }

    appendDecimal(): void {
        const parts = this.display.split(/[\+\-\×\÷]/);
        const currentPart = parts[parts.length - 1];

        if (!currentPart.includes('.')) {
            this.display += '.';
            this.expression = this.display;
        }
        this.errorMessage = null;
    }

    calculate(): void {
        if (!this.display || this.display === '0' || this.isCalculating) return;

        this.isCalculating = true;
        this.errorMessage = null;

        const expresionParaEnviar = this.display
            .replace(/×/g, '*')
            .replace(/÷/g, '/');

        this.subscription = this.calculadoraService.operar(expresionParaEnviar)
            .subscribe({
                next: (response) => {
                    this.lastResult = response.resultado;
                    this.display = response.resultado.toString();
                    this.expression = this.display;

                    const historialItem: HistorialItemLocal = {
                        ...response,
                        timestamp: new Date().toISOString(),
                        expresionMostrar: this.display
                    };

                    this.addToHistorial(historialItem);
                    this.saveHistorialLocal();
                    this.isCalculating = false;
                },
                error: (error) => {
                    console.error('Error en cálculo:', error);
                    this.errorMessage = error.message || 'Error en el cálculo';
                    this.display = 'Error';
                    this.isCalculating = false;

                    setTimeout(() => {
                        if (this.display === 'Error') {
                            this.display = this.expression || '0';
                        }
                    }, 2000);
                }
            });
    }

    addToHistorial(item: HistorialItemLocal): void {
        this.historial.unshift(item);

        if (this.historial.length > 10) {
            this.historial = this.historial.slice(0, 10);
        }
    }

    saveHistorialLocal(): void {
        try {
            localStorage.setItem('calculadora_historial', JSON.stringify(this.historial));
        } catch (e) {
            console.warn('No se pudo guardar el historial en localStorage');
        }
    }

    loadHistorialLocal(): void {
        try {
            const saved = localStorage.getItem('calculadora_historial');
            if (saved) {
                this.historial = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('No se pudo cargar el historial desde localStorage');
        }
    }

    clear(): void {
        this.display = '0';
        this.expression = '';
        this.errorMessage = null;
    }

    deleteLast(): void {
        if (this.display.length > 1) {
            this.display = this.display.slice(0, -1);
        } else {
            this.display = '0';
        }
        this.expression = this.display;
        this.errorMessage = null;
    }

    porcentaje(): void {
        try {
            const value = parseFloat(this.display);
            if (!isNaN(value)) {
                this.display = (value / 100).toString();
                this.expression = this.display;
            }
        } catch (e) {
            this.errorMessage = 'Error al calcular porcentaje';
        }
    }

    formatNumber(num: string): string {
        const parts = num.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    getDisplayFormatted(): string {
        if (this.display === 'Error') return this.display;

        const num = parseFloat(this.display);
        if (!isNaN(num) && this.display.indexOf('+') === -1 &&
            this.display.indexOf('-') === -1 &&
            this.display.indexOf('×') === -1 &&
            this.display.indexOf('÷') === -1) {
            return this.formatNumber(this.display);
        }
        return this.display;
    }
}