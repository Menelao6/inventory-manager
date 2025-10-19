import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
    },
    {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup)
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'admin/manage',
        loadComponent: () => import('./features/admin/manage-inventory/manage-inventory').then(m => m.ManageInventory)
    },
    {
        path: 'manager',
        loadComponent: () => import('./features/manager/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'customer',
        loadComponent: () => import('./features/customer/dashboard/dashboard').then(m => m.Dashboard)
    }
];
