import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CalculadoraComponent } from './pages/calculadora/calculadora.component';
import { HistorialComponent } from './pages/historial/historial.component';
// ... otros imports

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'calculadora', component: CalculadoraComponent },
  { path: 'historial', component: HistorialComponent },
  // ... otras rutas
];