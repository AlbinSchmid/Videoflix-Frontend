import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [
    MatButtonModule,
    HeaderComponent,
    FooterComponent,
    RouterModule,
    FormsModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  route = inject(Router)
  email: string = ''
  showEmailError: boolean = false

  /**
   * Handles the submission of a form. If the form is valid, it navigates to the registration page
   * with the provided email as a query parameter. If the form is invalid and the email field is empty,
   * it sets a flag to display an email error message.
   *
   * @param form - The form object containing the form's state and validation status.
   */
  submitForm(form: any): void {
    if (form.valid) {
      console.log('Form submitted:', this.email);
      this.route.navigate(['/registration'], { queryParams: { email: this.email } });
    } else {
      if (this.email === '') {
        this.showEmailError = true;
      }
    }
  }
}
