import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';

import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './views/login/auth.service';
import { HttpClientModule } from '@angular/common/http';

import { ToastrModule } from 'ngx-toastr';
import { AuthGuard } from './views/guard/auth.guard';
import { CadastroUsuariosComponent } from './views/cadastros/cadastro-usuarios/cadastro-usuarios.component';
import { CadastroProdutosComponent } from './views/cadastros/cadastro-produtos/cadastro-produtos.component';
import { HistoricoPedidosComponent } from './views/cadastros/historico-pedidos/historico-pedidos.component';
import { CadastroPedidosComponent } from './views/cadastros/cadastro-pedidos/cadastro-pedidos.component';
import { ListaUsuariosComponent } from './views/cadastros/lista-usuarios/lista-usuarios.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TesteNavComponent } from './views/cadastros/teste-nav/teste-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TesteFormComponent } from './views/cadastros/teste-form/teste-form.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatNativeDateModule, MatRippleModule, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


import { ListaProdutosComponent } from './views/cadastros/lista-produtos/lista-produtos.component';
import { ListaPedidosComponent } from './views/cadastros/lista-pedidos/lista-pedidos.component';
import { ListaHistoricoPedidosComponent } from './views/cadastros/lista-historico-pedidos/lista-historico-pedidos.component';
import { ConfirmDialogComponent } from './views/confirm-dialog/confirm-dialog.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { CatalogoService } from './views/cadastros/services/catalogo.service';
import { ListaCatalogosComponent } from './views/cadastros/lista-catalogos/lista-catalogos.component';
import { CatalogoComponent } from './views/cadastros/cadastro-catalogo/catalogo.component';
import { ListaProdutosCatalogoComponent } from './views/cadastros/cadastro-catalogo/lista-produtos-catalogo/lista-produtos-catalogo.component';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData ,CurrencyPipe} from '@angular/common';
import { ProdutosService } from './views/cadastros/services/produtos.service';
import { PedidosService } from './views/cadastros/services/pedidos.service';
import { PedidoClienteComponent, SearchFilterPipe } from './views/cadastros/pedido-cliente/pedido-cliente.component';
import { PaginaSucessoComponent } from './views/cadastros/pagina-sucesso/pagina-sucesso.component';
import { PedidosHistoricoService } from './views/cadastros/services/pedidos-historico.service';
import { NgxLoadingModule } from 'ngx-loading';
import { PedidosHistoricoViewComponent } from './views/cadastros/pedidos-historico-view/pedidos-historico-view.component';

import {DragDropModule} from '@angular/cdk/drag-drop';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { ListaClientesComponent } from './views/cadastros/lista-clientes/lista-clientes.component';
import { CadastroClientesComponent } from './views/cadastros/cadastro-clientes/cadastro-clientes.component'
import { ClientesService } from './views/cadastros/services/clientes.service';
import { ListaClientesBuscaComponent } from './views/cadastros/cadastro-pedidos/lista-clientes-busca/lista-clientes-busca.component';
import { FilterPipe } from './views/filter-pipe.pipe';


registerLocaleData(localePt, 'pt-BR');

const maskConfig: Partial<IConfig> = {
  validation: false,
};


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    AngularFireModule.initializeApp(environment.firebase),   
    AngularFireAuthModule,
    AngularFirestoreModule,
    FormsModule,
    ReactiveFormsModule,    
    HttpClientModule,
    ToastrModule.forRoot(),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    NgxLoadingModule.forRoot({}),
    DragDropModule,
    NgxMaskModule.forRoot(maskConfig),    
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    RegisterComponent,
    CadastroUsuariosComponent,
    CadastroProdutosComponent,
    HistoricoPedidosComponent,
    CadastroPedidosComponent,
    ListaUsuariosComponent,
    TesteNavComponent,
    TesteFormComponent,
    ListaProdutosComponent,
    ListaPedidosComponent,
    ListaHistoricoPedidosComponent,
    ConfirmDialogComponent,
    CatalogoComponent,
    ListaProdutosCatalogoComponent,
    ListaCatalogosComponent,
    PedidoClienteComponent,
    PaginaSucessoComponent,
    PedidosHistoricoViewComponent,
    SearchFilterPipe,
    ListaClientesComponent,
    CadastroClientesComponent,
    ListaClientesBuscaComponent,
    FilterPipe
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy    
  },
  AuthService,
  AuthGuard,
  CatalogoService,
  PedidosService,
  ProdutosService,
  PedidosHistoricoService,
  { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
  {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
  { provide: LOCALE_ID, useValue: 'pt-BR' }  ,
  {provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL'},
  CurrencyPipe,
  SearchFilterPipe,
  ClientesService
  
],
  entryComponents: [ConfirmDialogComponent,ListaProdutosCatalogoComponent,ListaClientesBuscaComponent],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
