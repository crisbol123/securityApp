import { Routes } from '@angular/router';
import path from 'node:path';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { RegistroDatosComponent } from './registro-datos/registro-datos.component';

export const routes: Routes = [
    {path : '', component: LoginComponent},
    { path: 'admin-interfaz', component: AdminComponent },
    {path: 'app-registro-datos', component: RegistroDatosComponent}

];
