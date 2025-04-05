import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ApiService } from '../shared/services/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorService } from '../shared/services/error.service';

@Component({
  selector: 'app-landing-page',
  imports: [
    MatButtonModule,
    HeaderComponent,
    FooterComponent,
    RouterModule,
    FormsModule,
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  apiService = inject(ApiService)
  errorService = inject(ErrorService)
  router = inject(Router)

  showLoadingSpinner: boolean = false
  showEmailError: boolean = false

  checkEmailEndpoint = 'check-email/'

  data = {
    email: ''
  }

  /**
   * Handles the submission of a form. If the form is valid, it navigates to the registration page
   * with the provided email as a query parameter. If the form is invalid and the email field is empty,
   * it sets a flag to display an email error message.
   *
   * @param form - The form object containing the form's state and validation status.
   */
  submitForm(form: any): void {
    if (form.valid) {
      this.showLoadingSpinner = true;
      this.sendPostRequest();
    } else {
      if (this.data.email === '') {
        this.showEmailError = true;
      }
    }
  }

  /**
   * Sends a POST request to the specified endpoint with the provided data.
   * Subscribes to the response and handles success and error scenarios.
   *
   * @remarks
   * This method uses the `apiService` to send the POST request. On a successful
   * response, it invokes the `requestSuccess` method with the response data.
   * In case of an error, it logs the error to the console and disables the loading spinner.
   *
   * @returns {void} This method does not return a value.
   */
  sendPostRequest(): void {
    this.apiService.postData(this.checkEmailEndpoint, this.data).subscribe({
      next: (res) => {
        this.requestSuccess(res);
      },
      error: (err) => {
        console.log(err)
        this.showLoadingSpinner = false
      }
    })
  }


  /**
   * Handles the success response of a request and navigates the user
   * to the appropriate route based on the response data.
   *
   * @param res - The response object from the request. It is expected to have an `exist` property
   *              indicating whether the user exists, and potentially other string properties
   *              containing success messages.
   *
   * @remarks
   * - If `res.exist` is `true`, the user is navigated to the 'login' route with the email as a query parameter.
   *   Success messages from the response are stored in the `errorService.successMessages` array.
   * - If `res.exist` is `false`, the user is navigated to the 'registration' route with the email as a query parameter.
   * - The `showEmailError` and `showLoadingSpinner` flags are set to `false` after handling the response.
   */
  requestSuccess(res: any): void {
    if (res.exist == true) {
      this.router.navigate(['login'], { queryParams: { email: this.data.email } });
      this.errorService.successMessages = []
      this.getSuccessMessages(res)
    } else {
      this.router.navigate(['registration'], { queryParams: { email: this.data.email } });
    }
    this.showEmailError = false
    this.showLoadingSpinner = false
  }

  getSuccessMessages(res: any): void {
    for (const key in res) {
      if (typeof res[key] === 'string') {
        this.errorService.successMessages.push(res[key]);
      }
    }
  }
}
