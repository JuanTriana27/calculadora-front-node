import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface HistorialItem {
    _id: string;
    tipo: string;
    expresion?: string;
    a?: number;
    b?: number;
    resultado: number;
    fecha: string;
    __v: number;
}

@Component({
    selector: 'app-historial',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
    // Datos y estado
    historialItems: HistorialItem[] = [];
    isLoading = false;
    error: string | null = null;

    // Paginación
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 1;
    totalItems = 0;

    // Filtros (opcional, para futuras mejoras)
    filterType = 'todos';

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadHistorial();
    }

    // Cargar historial desde la API
    loadHistorial(): void {
        this.isLoading = true;
        this.error = null;

        const apiUrl = 'http://localhost:3000/api/historial';

        this.http.get<HistorialItem[]>(apiUrl).subscribe({
            next: (data) => {
                // Ordenar por fecha más reciente primero
                this.historialItems = data.sort((a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );
                this.totalItems = this.historialItems.length;
                this.calculatePagination();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar historial:', err);
                this.error = 'No se pudo cargar el historial. Intenta nuevamente.';
                this.isLoading = false;
            }
        });
    }

    // Formatear fecha
    formatFecha(fechaString: string): string {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Obtener descripción de la operación
    getDescripcion(item: HistorialItem): string {
        switch (item.tipo) {
            case 'suma':
                return `${item.a} + ${item.b}`;
            case 'resta':
                return `${item.a} - ${item.b}`;
            case 'multiplicacion':
                return `${item.a} × ${item.b}`;
            case 'division':
                return `${item.a} ÷ ${item.b}`;
            case 'expresion':
                return item.expresion || 'Expresión matemática';
            default:
                return 'Operación';
        }
    }

    // Obtener icono según tipo
    getIconoTipo(tipo: string): string {
        const iconos: { [key: string]: string } = {
            'suma': 'fa-plus',
            'resta': 'fa-minus',
            'multiplicacion': 'fa-times',
            'division': 'fa-divide',
            'expresion': 'fa-calculator'
        };
        return iconos[tipo] || 'fa-question-circle';
    }

    // Obtener color según tipo
    getColorTipo(tipo: string): string {
        const colores: { [key: string]: string } = {
            'suma': 'badge-suma',
            'resta': 'badge-resta',
            'multiplicacion': 'badge-multiplicacion',
            'division': 'badge-division',
            'expresion': 'badge-expresion'
        };
        return colores[tipo] || 'badge-default';
    }

    // Paginación
    calculatePagination(): void {
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    }

    get paginatedItems(): HistorialItem[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.historialItems.slice(startIndex, endIndex);
    }

    getEndIndex(): number {
        return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    // Generar array de páginas para mostrar
    get pageNumbers(): number[] {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;

        if (endPage > this.totalPages) {
            endPage = this.totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    }

    // Exportar a JSON
    exportToJson(): void {
        const dataStr = JSON.stringify(this.historialItems, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `historial_calculadora_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Limpiar filtros
    clearFilters(): void {
        this.filterType = 'todos';
        this.currentPage = 1;
    }
}