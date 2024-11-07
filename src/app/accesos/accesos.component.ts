import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Acceso, AccesosService } from '../accesos.service';
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';

// Registrar componentes de Chart.js
Chart.register(...registerables);

// Definir módulo de Angular
@Component({
  selector: 'app-accesos',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './accesos.component.html',
  styleUrls: ['./accesos.component.css'],
  providers: [AccesosService]
})

export class AccesosComponent implements OnInit {
  accesos: Acceso[] = [];
  selectedPorteria: number | null = null;
  selectedMonth: string = ''; // Almacena el mes seleccionado en formato abreviado
  private myChart: Chart | null = null;

  // Variables para KPIs
  totalAccesos: number = 0;
  porcentajeAutenticados: number = 0;
  diaMayorAcceso: string = '';
  porteriaFrecuente: number | null = null;

  // Variable para gestionar el tipo de gráfico seleccionado
  graficoSeleccionado: string = 'first';

  constructor(private accesosService: AccesosService) {}

  ngOnInit(): void {
    // Inicialización o cualquier llamada inicial
  }

  // Seleccionar portería y obtener accesos
  seleccionarPorteria(porteria: number): void {
    this.selectedPorteria = porteria;
    this.obtenerAccesos(porteria);
  }

  // Obtener accesos por portería desde el servicio
  obtenerAccesos(porteria: number): void {
    this.accesosService.obtenerAccesosPorPorteria(porteria).subscribe((data) => {
      this.accesos = data;
    });
  }

  // Extraer día de la fecha
  extraerDia(fecha: string): string {
    return fecha.split(' ')[2]; // Día es el tercer elemento
  }

  // Extraer mes de la fecha (abreviado)
  extraerMes(fecha: string): string {
    return fecha.split(' ')[1]; // Mes es el segundo elemento
  }

  // Extraer hora de la fecha
  extraerHora(fecha: string): string {
    return fecha.split(' ')[3]; // Hora es el cuarto elemento
  }

  // Cambiar el tipo de gráfico seleccionado y generar reporte
  obtenerTipo(tipo: string): void {
    this.graficoSeleccionado = tipo;
    this.generarReportes();
  }

  // Generar reportes según el gráfico seleccionado
  generarReportes(): void {
    if (this.myChart) {
      this.myChart.destroy();
    }

    this.calcularKPIs(); // Calcular KPIs antes de generar el gráfico

    switch (this.graficoSeleccionado) {
      case 'bar':
        // Mostrar el canvas principal y ocultar el circular
        document.getElementById('myChart2')!.style.display = 'none';
        document.getElementById('myChart')!.style.display = 'block';
        this.generarGraficoBarras();
        break;
      case 'first':
        // Mostrar el canvas principal y ocultar el circular
        document.getElementById('myChart2')!.style.display = 'none';
        document.getElementById('myChart')!.style.display = 'block';
        this.generarGraficoAccesosMensuales();
        break;
      case 'histogram':
        // Mostrar el canvas principal y ocultar el circular
        document.getElementById('myChart2')!.style.display = 'none';
        document.getElementById('myChart')!.style.display = 'block';
        this.generarHistogramaHoras();
        break;
      case 'pie':
        // Mostrar el canvas del gráfico circular
        document.getElementById('myChart2')!.style.display = 'block';
        document.getElementById('myChart')!.style.display = 'none';
        this.generarGraficoCircular();
        break;
      case 'line':
        // Mostrar el canvas principal y ocultar el circular
        document.getElementById('myChart2')!.style.display = 'none';
        document.getElementById('myChart')!.style.display = 'block';
        this.generarGraficoLineas();
        break;
    }
  }

  // Actualizar el gráfico cuando cambie el mes seleccionado
  onMonthChange(): void {
    this.generarReportes();
  }

  // Calcular los KPIs (indicadores clave de rendimiento)
  calcularKPIs(): void {
    this.totalAccesos = this.accesos.length;
    const autenticados = this.accesos.filter(acceso => acceso.autenticado).length;
    this.porcentajeAutenticados = (autenticados / this.totalAccesos) * 100;

    // Cálculo del día con más accesos
    const accesosPorDia = this.accesos.reduce((acc, acceso) => {
      const dia = this.extraerDia(acceso.fecha_hora);
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.diaMayorAcceso = Object.keys(accesosPorDia).reduce((a, b) => accesosPorDia[a] > accesosPorDia[b] ? a : b);

    // Cálculo de la portería más utilizada
    const accesosPorPorteria = this.accesos.reduce((acc, acceso) => {
      acc[acceso.porteria] = (acc[acceso.porteria] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    this.porteriaFrecuente = +Object.keys(accesosPorPorteria).reduce((a, b) =>
      accesosPorPorteria[+a] > accesosPorPorteria[+b] ? a : b
    );
  }

  // Gráfico de accesos mensuales filtrado por el mes seleccionado
  private generarGraficoAccesosMensuales(): void {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    const accesosFiltrados = this.accesos.filter(acceso => {
      return this.selectedMonth ? this.extraerMes(acceso.fecha_hora) === this.selectedMonth : true;
    });

    const labels = [...new Set(accesosFiltrados.map(acceso => this.extraerDia(acceso.fecha_hora)))];
    const autenticados = labels.map(dia =>
      accesosFiltrados.filter(acceso => this.extraerDia(acceso.fecha_hora) === dia && acceso.autenticado).length
    );
    const noAutenticados = labels.map(dia =>
      accesosFiltrados.filter(acceso => this.extraerDia(acceso.fecha_hora) === dia && !acceso.autenticado).length
    );

    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Accesos Autenticados', data: autenticados, backgroundColor: 'rgba(75, 192, 192, 0.7)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 },
          { label: 'Accesos No Autenticados', data: noAutenticados, backgroundColor: 'rgba(255, 99, 132, 0.7)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 }
        ]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }

  // Gráfico circular para autenticados vs no autenticados
  private generarGraficoCircular(): void {
    const autenticados = this.accesos.filter(acceso => acceso.autenticado).length;
    const noAutenticados = this.accesos.length - autenticados;
    const ctx = document.getElementById('myChart2') as HTMLCanvasElement;
    // Crear el gráfico circular con tamaño reducido
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Autenticados', 'No Autenticados'],
        datasets: [{
          data: [autenticados, noAutenticados],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      },
      options: {
        responsive:false
       }
    });
  }

  // Gráfico de barras para accesos por portería
  private generarGraficoBarras(): void {
    const accesosPorPorteria = this.accesos.reduce((acc, acceso) => {
      acc[acceso.porteria] = (acc[acceso.porteria] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(accesosPorPorteria),
        datasets: [{ label: 'Accesos por Portería', data: Object.values(accesosPorPorteria), backgroundColor: '#2196F3' }]
      },
      options: { responsive: true }
    });
  }

  // Gráfico de líneas para tendencia de accesos por día
  private generarGraficoLineas(): void {
    const accesosPorDia = this.accesos.reduce((acc, acceso) => {
      const dia = this.extraerDia(acceso.fecha_hora);
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    this.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(accesosPorDia),
        datasets: [{ label: 'Tendencia de Accesos', data: Object.values(accesosPorDia), backgroundColor: '#FF9800', borderColor: '#FF9800', fill: false }]
      },
      options: { responsive: true }
    });
  }

  // Histograma de accesos por hora
  private generarHistogramaHoras(): void {
    const accesosPorHora = this.accesos.reduce((acc, acceso) => {
      const hora = this.extraerHora(acceso.fecha_hora); // Usamos la nueva función
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(accesosPorHora),
        datasets: [{
          label: 'Accesos por Hora',
          data: Object.values(accesosPorHora),
          backgroundColor: '#8BC34A'
        }]
      },
      options: { responsive: true }
    });
  }

}









