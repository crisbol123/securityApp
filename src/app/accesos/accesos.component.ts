import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Acceso, AccesosService } from '../accesos.service';
import { HttpClientModule } from '@angular/common/http'; 


@Component({
  selector: 'app-accesos',
  standalone: true,
  imports: [HttpClientModule,CommonModule],
  templateUrl: './accesos.component.html',
  styleUrls: ['./accesos.component.css'],
   providers: [AccesosService]
})
export class AccesosComponent implements OnInit {
  accesos: Acceso[] = [];
  selectedPorteria: number | null = null; 

  constructor(private accesosService: AccesosService) {}

  ngOnInit(): void {}

  seleccionarPorteria(porteria: number): void {
    this.selectedPorteria = porteria; 
    this.obtenerAccesos(porteria); 
  }

  obtenerAccesos(porteria: number): void {
    this.accesosService.obtenerAccesosPorPorteria(porteria).subscribe((data) => {
      this.accesos = data;
    });
  }
}
