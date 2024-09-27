import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; // Importa MatTableModule
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Usuario {
  id: number;
  nombre: string;
  cedula: string;
}

@Component({
  selector: 'app-gestion-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    RouterOutlet, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatCardModule, 
    MatTableModule, 
    MatSnackBarModule  
  ],
  templateUrl: './gestion-usuario.component.html',
  styleUrls: ['./gestion-usuario.component.css']
})
export class GestionUsuarioComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'cedula'];
  dataSource = new MatTableDataSource<Usuario>([
    { id: 1, nombre: 'Juan Perez', cedula: '123456789' },
    { id: 2, nombre: 'Maria Gomez', cedula: '987654321' },
    { id: 3, nombre: 'Carlos Ruiz', cedula: '456123789' },
    { id: 4, nombre: 'Ana Torres', cedula: '789456123' },
    { id: 5, nombre: 'Luis Fernandez', cedula: '321654987' }
  ]);

  selectedUsuario: Usuario | null = null;
  usuarioForm: FormGroup;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private route: Router) {
    this.usuarioForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      nombre: ['', Validators.required],
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  ngOnInit(): void {}

  selectUsuario(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.usuarioForm.patchValue({
      id: usuario.id,
      nombre: usuario.nombre,
      cedula: usuario.cedula
    });
  }

  eliminarUsuario(): void {
    if (this.selectedUsuario) {
      console.log(`Eliminar usuario con cédula: ${this.selectedUsuario.cedula}`);
      this.dataSource.data = this.dataSource.data.filter(u => u !== this.selectedUsuario);
      this.selectedUsuario = null;
      this.usuarioForm.reset();
      this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 2000 });
    }
  }

  actualizarUsuario(): void {
    if (this.selectedUsuario && this.usuarioForm.valid) {
      console.log(`Actualizar usuario con cédula: ${this.selectedUsuario.cedula}`);
      const updatedUsuario = { ...this.selectedUsuario, ...this.usuarioForm.value };
      const index = this.dataSource.data.findIndex(u => u.id === this.selectedUsuario!.id);
      this.dataSource.data[index] = updatedUsuario;
      this.dataSource._updateChangeSubscription();  
      this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 2000 });
    }
  }

  crearUsuario(): void {
   this.route.navigate(['/app-registro-datos']);
  }

  limpiarFormulario(): void {
    this.selectedUsuario = null;
    this.usuarioForm.reset();
  }
}
