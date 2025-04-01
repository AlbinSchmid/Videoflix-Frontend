import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { FormComponent } from '../shared/components/form/form.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    HeaderComponent,
    FooterComponent,
    FormComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

}
