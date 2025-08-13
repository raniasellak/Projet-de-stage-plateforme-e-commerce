import { Routes } from '@angular/router';

// Composants standalone
import { AdminTemplate } from './admin-template/admin-template';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Clients } from './clients/clients';
import { Payments } from './payments/payments';
import { LoadClients } from './load-clients/load-clients';
import { LoadPayments } from './load-payments/load-payments';
import { Products } from './products/products';
import { LoadProducts } from './load-products/load-products';
import { ClientDetails } from './client-details/client-details';
import { ClientLayout } from './layouts/client-layout/client-layout';
import { AddProduct } from './add-product/add-product';
import { EditProduct } from './edit-product/edit-product';
import { ViewProduct } from './view-product/view-product';
import { Boutique } from './boutique/boutique';
import { Contact } from './contact/contact';
import { Apropos } from './apropos/apropos';

// Guards
import { AuthorizationGuard } from './guards/authorization.guard';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: ClientLayout, // Layout client
    children: [
      { path: 'home', component: Home, canActivate: [AuthGuard] },
      { path: 'boutique', component: Boutique, canActivate: [AuthGuard] },
      { path: 'contact', component: Contact, canActivate: [AuthGuard] },
      { path: 'apropos', component: Apropos, canActivate: [AuthGuard] }
    ]
  },

  // Routes publiques
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile },

  // Routes admin
  {
    path: 'admin',
    component: AdminTemplate,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
      { path: 'clients', component: Clients, canActivate: [AuthGuard] },
      { path: 'payments', component: Payments, canActivate: [AuthGuard] },

      // Produits
      { path: 'products/add', component: AddProduct, canActivate: [AuthGuard] },
      { path: 'products/edit/:id', component: EditProduct, canActivate: [AuthGuard] },
      { path: 'products/view/:id', component: ViewProduct, canActivate: [AuthGuard] },
      { path: 'products', component: Products, canActivate: [AuthGuard] },

      // Chargement de données
      { path: 'loadClients', component: LoadClients, canActivate: [AuthorizationGuard], data: { roles: ['ADMIN'] } },
      { path: 'loadPayments', component: LoadPayments, canActivate: [AuthorizationGuard], data: { roles: ['ADMIN'] } },
      { path: 'loadProducts', component: LoadProducts, canActivate: [AuthorizationGuard], data: { roles: ['ADMIN'] } },
      { path: 'client-details/:cni', component: ClientDetails, canActivate: [AuthGuard] }
    ]
  },

  // Route par défaut
  { path: '**', redirectTo: '/login' }
];
