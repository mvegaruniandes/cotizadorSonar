import { LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from './app.component';
import { SimulatorComponent } from './features/simulator/simulator.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionInfoComponent } from './shared/components/accordion-info/accordion-info.component';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SimulationDatatableComponent } from './shared/components/simulation-datatable/simulation-datatable.component';
import { CreditSummaryInformationComponent } from './shared/components/credit-summary-information/credit-summary-information.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { NumberFormatPipe } from './core/pipes/number-format.pipe';
import { PersonalizeSimulationModalComponent } from './shared/components/personalize-simulation-modal/personalize-simulation-modal.component';
import { AlertModalComponent } from './shared/components/alert-modal/alert-modal.component';
import { NgToastModule } from 'ng-angular-popup';
import { PercentageFormatPipe } from './core/pipes/percentage-format.pipe';
import { InputMessageErrorComponent } from './shared/components/input-message-error/input-message-error.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    SimulatorComponent,
    NumberFormatPipe,
    PercentageFormatPipe,
    AccordionInfoComponent,
    SimulationDatatableComponent,
    CreditSummaryInformationComponent,
    PersonalizeSimulationModalComponent,
    AlertModalComponent,
    InputMessageErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule.forRoot({ type: 'ball-beat' }),
    NgToastModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() {
  }
 }
