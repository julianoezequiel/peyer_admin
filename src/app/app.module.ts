import "firebase/storage";

import { DragDropModule } from "@angular/cdk/drag-drop";
import { LayoutModule } from "@angular/cdk/layout";
import {
  CurrencyPipe,
  HashLocationStrategy,
  LocationStrategy,
  LOCATION_INITIALIZED,
  registerLocaleData,
} from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import localePt from "@angular/common/locales/pt";
import { APP_INITIALIZER, Injector, LOCALE_ID, NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppFooterModule,
  AppHeaderModule,
  AppSidebarModule,
} from "@coreui/angular";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ChartsModule } from "ng2-charts";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";
import { NgxLoadingModule } from "ngx-loading";
import { IConfig, NgxMaskModule } from "ngx-mask";
import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from "ngx-perfect-scrollbar";
import { ToastrModule } from "ngx-toastr";

import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routing";
import { DefaultLayoutComponent } from "./containers";
import { MaterialModule } from "./material.module";
import { CatalogoComponent } from "./views/cadastros/cadastro-catalogo/catalogo.component";
import { ListaProdutosCatalogoComponent } from "./views/cadastros/cadastro-catalogo/lista-produtos-catalogo/lista-produtos-catalogo.component";
import { CadastroClientesComponent } from "./views/cadastros/cadastro-clientes/cadastro-clientes.component";
import { CadastroPedidosComponent } from "./views/cadastros/cadastro-pedidos/cadastro-pedidos.component";
import { ListaClientesBuscaComponent } from "./views/cadastros/cadastro-pedidos/lista-clientes-busca/lista-clientes-busca.component";
import { CadastroProdutosComponent } from "./views/cadastros/cadastro-produtos/cadastro-produtos.component";
import { HistoricoPedidosComponent } from "./views/cadastros/historico-pedidos/historico-pedidos.component";
import { ListaCatalogosComponent } from "./views/cadastros/lista-catalogos/lista-catalogos.component";
import { ListaClientesComponent } from "./views/cadastros/lista-clientes/lista-clientes.component";
import { ListaHistoricoPedidosComponent } from "./views/cadastros/lista-historico-pedidos/lista-historico-pedidos.component";
import { ListaPedidosComponent } from "./views/cadastros/lista-pedidos/lista-pedidos.component";
import { ListaProdutosComponent } from "./views/cadastros/lista-produtos/lista-produtos.component";
import { PaginaSucessoComponent } from "./views/cadastros/pagina-sucesso/pagina-sucesso.component";
import {
  PedidoClienteComponent,
  SearchFilterPipe,
} from "./views/cadastros/pedido-cliente/pedido-cliente.component";
import { PedidosHistoricoViewComponent } from "./views/cadastros/pedidos-historico-view/pedidos-historico-view.component";
import { CatalogoService } from "./views/cadastros/services/catalogo.service";
import { ClientesService } from "./views/cadastros/services/clientes.service";
import { PedidosHistoricoService } from "./views/cadastros/services/pedidos-historico.service";
import { PedidosService } from "./views/cadastros/services/pedidos.service";
import { ProdutosService } from "./views/cadastros/services/produtos.service";
import { TesteFormComponent } from "./views/cadastros/teste-form/teste-form.component";
import { TesteNavComponent } from "./views/cadastros/teste-nav/teste-nav.component";
import { CadastroUsuariosComponent } from "./views/cadastros/usuarios/cadastro-usuarios/cadastro-usuarios.component";
import { ListaUsuariosComponent } from "./views/cadastros/usuarios/lista-usuarios/lista-usuarios.component";
import { ConfirmDialogComponent } from "./views/confirm-dialog/confirm-dialog.component";
import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { FilterPipe } from "./views/filter-pipe.pipe";
import { AuthGuard } from "./views/guard/auth.guard";
import { AuthService } from "./views/login/auth.service";
import { LoginComponent } from "./views/login/login.component";
import { RegisterComponent } from "./views/register/register.component";
import { ModalModule } from "ngx-bootstrap/modal";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

// Import containers
const APP_CONTAINERS = [DefaultLayoutComponent];

// Import routing module
// Import 3rd party components

//registerLocaleData(localePt, "pt-BR");

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
    AngularFireStorageModule,
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
    MatGridListModule,
    NgxMaskModule.forRoot(maskConfig),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MaterialModule,
    ModalModule.forRoot(),
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
    FilterPipe,
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    AuthService,
    AuthGuard,
    CatalogoService,
    PedidosService,
    ProdutosService,
    PedidosHistoricoService,
    //{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    { provide: MAT_DATE_LOCALE, useValue: "en-US" },
    { provide: LOCALE_ID, useValue: "en-US" },
    //{provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL'},
    CurrencyPipe,
    SearchFilterPipe,
    ClientesService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ],
  entryComponents: [
    ConfirmDialogComponent,
    ListaProdutosCatalogoComponent,
    ListaClientesBuscaComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

// for the application to wait for the translations to be initialized before rendering the page
export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      const langToSet = 'en'
      translate.setDefaultLang('en');
      translate.use(langToSet).subscribe(() => {
        console.info(`Successfully initialized '${langToSet}' language.'`);
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}
