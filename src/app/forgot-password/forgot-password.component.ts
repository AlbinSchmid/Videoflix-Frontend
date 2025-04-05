import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { FormComponent } from '../shared/components/form/form.component';
import { ErrorService } from '../shared/services/error.service';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [
    HeaderComponent,
    FooterComponent,
    FormComponent,
    ErrorMessageComponent,
    CommonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  errorService = inject(ErrorService)
}
