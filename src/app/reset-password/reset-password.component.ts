import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { FormComponent } from '../shared/components/form/form.component';

@Component({
  selector: 'app-reset-password',
  imports: [
    HeaderComponent,
    FooterComponent,
    FormComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

}
