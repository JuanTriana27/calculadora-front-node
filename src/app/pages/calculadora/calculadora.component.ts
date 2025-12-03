import { Component, OnInit, HostListener, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalculadoraService, OperacionResponse } from '../../shared/services/calculadora/calculadora.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

interface HistorialItemLocal extends OperacionResponse {
    timestamp: string;
    expresionMostrar: string;
}

@Component({
    selector: 'app-calculadora',
    standalone: true,
    imports: [CommonModule, RouterModule],
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
    memoriaActiva = false;
    modoCientifico = false;
    temaOscuro = false;

    private subscription: Subscription | null = null;

    constructor(
        private calculadoraService: CalculadoraService,
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2
    ) { }

    ngOnInit(): void {
        this.loadHistorialLocal();
        this.cargarTema();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    cargarTema(): void {
        const temaGuardado = localStorage.getItem('calculadora_tema');
        this.temaOscuro = temaGuardado === 'oscuro';
        this.aplicarTema();
    }

    toggleTheme(): void {
        this.temaOscuro = !this.temaOscuro;
        this.aplicarTema();
        localStorage.setItem('calculadora_tema', this.temaOscuro ? 'oscuro' : 'claro');
    }

    aplicarTema(): void {
        if (this.temaOscuro) {
            this.renderer.setAttribute(this.document.body, 'data-theme', 'dark');
        } else {
            this.renderer.removeAttribute(this.document.body, 'data-theme');
        }
    }

    toggleMemoria(): void {
        this.memoriaActiva = !this.memoriaActiva;
    }

    toggleModo(): void {
        this.modoCientifico = !this.modoCientifico;
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const key = event.key;

        // Prevenir comportamiento por defecto solo para teclas relevantes
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '.', 'Enter', 'Escape', 'Backspace'].includes(key)) {
            event.preventDefault();
        }

        switch (key) {
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
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
            case 'Enter': case '=':
                this.calculate();
                break;
            case 'Escape':
                this.clear();
                break;
            case 'Backspace':
                this.deleteLast();
                break;
            case 'm': case 'M':
                if (event.ctrlKey) this.toggleMemoria();
                break;
            case 's': case 'S':
                if (event.ctrlKey) this.toggleModo();
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
                    this.display = this.formatNumber(response.resultado.toString());
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
                }
            });
    }

    clearError(): void {
        this.errorMessage = null;
        if (this.display === 'Error') {
            this.display = this.expression || '0';
        }
    }

    addToHistorial(item: HistorialItemLocal): void {
        this.historial.unshift(item);

        if (this.historial.length > 20) {
            this.historial = this.historial.slice(0, 20);
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
        // Solo formatear números completos (sin operadores)
        if (this.display.match(/[\+\-\×\÷]/)) {
            return num;
        }

        const parts = num.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    getDisplayFormatted(): string {
        if (this.display === 'Error') return this.display;

        // Si es un número puro, formatearlo
        if (!this.display.match(/[\+\-\×\÷]/)) {
            return this.formatNumber(this.display);
        }
        return this.display;
    }

    funcionCientifica(funcion: string): void {
        const valor = parseFloat(this.display);
        if (isNaN(valor)) return;

        let resultado: number;
        switch (funcion) {
            case 'sin':
                resultado = Math.sin(valor * Math.PI / 180);
                break;
            case 'cos':
                resultado = Math.cos(valor * Math.PI / 180);
                break;
            case 'tan':
                resultado = Math.tan(valor * Math.PI / 180);
                break;
            case 'log':
                resultado = Math.log10(valor);
                break;
            case 'ln':
                resultado = Math.log(valor);
                break;
            case 'sqrt':
                resultado = Math.sqrt(valor);
                break;
            case 'pow':
                resultado = Math.pow(valor, 2);
                break;
            case 'pi':
                resultado = Math.PI;
                break;
            default:
                return;
        }

        this.display = resultado.toString();
        this.expression = `${funcion}(${valor})`;
    }

    exportarResultado(): void {
        if (!this.lastResult) return;

        const data = {
            resultado: this.lastResult,
            expresion: this.expression,
            fecha: new Date().toISOString(),
            historial: this.historial.length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculadora_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}   