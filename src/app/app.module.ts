import { NewsDetailsDialog } from './views/pages/newsletters/newsletters-list/news-details-dialog/news-details-dialog.component';
import 'firebase/storage';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { CurrencyPipe, HashLocationStrategy, LOCATION_INITIALIZED, LocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Injector, LOCALE_ID, NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppAsideModule, AppBreadcrumbModule, AppFooterModule, AppHeaderModule, AppSidebarModule } from '@coreui/angular';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ChartsModule } from 'ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxLoadingModule } from 'ngx-loading';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToastrModule } from 'ngx-toastr';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { DefaultLayoutComponent } from './containers';
import { getDutchPaginatorIntl } from './dutch-paginator-intl';
import { MaterialModule } from './material.module';
import { AlertDialogComponent } from './shared/alert-dialog/alert-dialog.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { FilterPipe } from './shared/filter-pipe.pipe';
import { AuthGuard } from './views/auth/auth.guard';
import { ForgotPasswordComponent } from './views/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './views/auth/login/login.component';
import { AuthService } from './views/auth/services/auth.service';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { UsersRegistrationComponent } from './views/pages/users/users-registration/users-registration.component';
import { UsersListComponent } from './views/pages/users/users-list/users-list.component';
import {
  EmergencyContactsDialog,
} from './views/pages/users/users-list/emergency-contacts-dialog/emergency-contacts-dialog.component';
import { VehiclesListComponent } from './views/pages/vehicles/vehicles-list/vehicles-list.component';
import { VehiclesRegistrationComponent } from './views/pages/vehicles/vehicles-registration/vehicles-registration.component';
import { VehicleHistoryModule } from './views/pages/vehicle-history/vehicle-history.module';
import { NewslettersListComponent } from './views/pages/newsletters/newsletters-list/newsletters-list.component';
import { NewslettersRegistrationComponent } from './views/pages/newsletters/newsletters-registration/newsletters-registration.component';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 0
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
    //MatDatepickerModule,
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
    MatMomentDateModule,
    MatNativeDateModule,
    PerfectScrollbarModule,
    VehicleHistoryModule,
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    UsersRegistrationComponent,
    UsersListComponent,
    ConfirmDialogComponent,
    FilterPipe,
    ForgotPasswordComponent,
    AlertDialogComponent,
    EmergencyContactsDialog,
    VehiclesListComponent,
    VehiclesRegistrationComponent,
    NewslettersListComponent,
    NewslettersRegistrationComponent,
    NewsDetailsDialog
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    AuthService,
    AuthGuard,
    //{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    { provide: LOCALE_ID, useValue: "de-CH" },
    { provide: MAT_DATE_LOCALE, useValue: "de-CH" },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: "DD/MM/YYYY",
        },
        display: {
          dateInput: "DD/MM/YYYY",
          monthYearLabel: "MMMM YYYY",
          dateA11yLabel: "LL",
          monthYearA11yLabel: "MMMM YYYY",
        },
      },
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    //{provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL'},
    CurrencyPipe,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true,
    },
    {
      provide: MatPaginatorIntl,
      useValue: getDutchPaginatorIntl(),
    },
  ],
  entryComponents: [ConfirmDialogComponent, AlertDialogComponent, EmergencyContactsDialog, NewsDetailsDialog],
  bootstrap: [AppComponent],
})
export class AppModule {}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

// for the application to wait for the translations to be initialized before rendering the page
export function appInitializerFactory(
  translate: TranslateService,
  injector: Injector
) {
  return () =>
    new Promise<any>((resolve: any) => {
      const locationInitialized = injector.get(
        LOCATION_INITIALIZED,
        Promise.resolve(null)
      );
      locationInitialized.then(() => {
        const langToSet = "en";
        translate.setDefaultLang("en");
        translate.use(langToSet).subscribe(
          () => {
            console.info(`Successfully initialized '${langToSet}' language.'`);
          },
          (err) => {
            console.error(
              `Problem with '${langToSet}' language initialization.'`
            );
          },
          () => {
            resolve(null);
          }
        );
      });
    });
}
