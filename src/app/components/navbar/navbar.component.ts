import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
    isMenuOpen = false;

    menuItems = [
        {
            path: '/',
            icon: 'fa-home',
            label: 'Inicio',
            badge: null
        },
        {
            path: '/calculadora',
            icon: 'fa-calculator',
            label: 'Calculadora',
            badge: null
        },
        {
            path: '/historial',
            icon: 'fa-history',
            label: 'Historial',
            badge: null
        },
        {
            path: '/endpoints',
            icon: 'fa-code',
            label: 'Endpoints',
            badge: null
        }
    ];

    toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
    }

    closeMenuIfMobile(): void {
        if (window.innerWidth < 992) {
            this.isMenuOpen = false;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(): void {
        if (window.innerWidth >= 992) {
            this.isMenuOpen = false;
        }
    }
}