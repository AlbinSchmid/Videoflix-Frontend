import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { DeferBlockBehavior } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-form',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  errorService = inject(ErrorService)
  router = inject(Router);
  apiService = inject(ApiService)
  @Input() formType: string = '';
  @Input() signupEmail: string = '';
  @Input() loginEmail: string = '';


  loginEndpoint: string = 'login/';
  registrationEndpoint: string = 'registraion/';

  showLoadingSpinner: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showError: boolean = false;

  loginData = {
    email: '',
    password: '',
  }
  registrationData = {
    email: '',
    password: '',
    repeated_password: ''
  }
  forgotPasswordData = {
    email: '',
  }
  resetPasswordData = {
    password: '',
    repeated_password: ''
  }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * This method is used to perform component initialization logic.
   * Specifically, it sets the email address from the landing page into the form.
   */
  ngOnInit(): void {
    this.setEmailFromLandingPage();
  }

  /**
   * Sets the email address for either the registration or login process
   * based on the provided email values from the landing page.
   *
   * - If `signupEmail` is not an empty string, it assigns its value to `registrationData.email`.
   * - Otherwise, if `loginEmail` is not an empty string, it assigns its value to `loginData.email`.
   *
   * This method ensures that the appropriate email field is populated
   * depending on the context of the user's action.
   */
  setEmailFromLandingPage(): void {
    if (this.signupEmail !== '') {
      this.registrationData.email = this.signupEmail;
    } else if (this.loginEmail !== '') {
      this.loginData.email = this.loginEmail;
    }
  }

  /**
   * Submits the login form by sending the login data to the specified endpoint.
   *
   * @param form - The form object containing the login details.
   */
  submitLoginForm(form: any): void {
    if (form.valid) {
      this.sendPostRequest(this.loginEndpoint, this.loginData);
    } else {
      this.showError = true
    }
  }

  /**
   * Handles the submission of the registration form.
   * 
   * @param form - The form object containing the registration data and validation state.
   *               It is expected to have a `valid` property indicating the form's validity.
   * 
   * @remarks
   * If the form is valid, this method sends a POST request to the specified registration endpoint
   * with the provided registration data. If the form is invalid, it sets an error flag to indicate
   * a registration error.
   * 
   * @example
   * // Example usage in a template:
   * <form (ngSubmit)="submitRegistrationForm(registrationForm)">
   *   <!-- form fields here -->
   * </form>
   */
  submitRegistrationForm(form: any): void {
    if (form.valid && this.registrationData.password === this.registrationData.repeated_password) {
      this.showError = false;
      this.sendPostRequest(this.registrationEndpoint, this.registrationData);
    } else {
      this.showError = true;
    }
  }

  /**
   * Sends a POST request to the specified API endpoint with the provided data.
   * Subscribes to the response and handles both success and error cases.
   *
   * @param endpoint - The API endpoint to which the POST request will be sent.
   * @param data - The data object to be sent in the body of the POST request.
   *
   * On success:
   * - Logs the response to the console.
   *
   * On error:
   * - Logs the error to the console.
   * - Extracts the first error message from the `non_field_errors` array in the error response.
   * - Emits the extracted error message using the `errorMessage` event emitter.
   */
  sendPostRequest(endpoint: string, data: object): void {
    this.showLoadingSpinner = true;
    this.apiService.postData(endpoint, data).subscribe({
      next: (res) => {
        this.requestSuccess(res);
      },
      error: (err) => {
        this.requestError(err);
      }
    })
  }

  /**
   * Handles the successful response of a request.
   * 
   * This method is triggered when a request completes successfully. It performs the following actions:
   * - Logs the response to the console.
   * - Clears any existing error messages using the `errorService`.
   * - Hides the loading spinner by setting `showLoadingSpinner` to `false`.
   * - Navigates the user to the login page using the router.
   * - Clears the form data to reset the form state.
   * 
   * @param res - The response object received from the successful request.
   */
  requestSuccess(res: any): void {
    console.log(res);
    this.errorService.errorMessages = []
    this.showLoadingSpinner = false;
    this.router.navigate(['/login']);
    this.clearFormData();
  }

  /**
   * Handles and processes error responses from HTTP requests.
   * 
   * @param err - The error object received from the HTTP request.
   *   It is expected to have an `error` property containing the error details.
   * 
   * This method performs the following actions:
   * - Logs the error to the console for debugging purposes.
   * - Disables the loading spinner by setting `showLoadingSpinner` to `false`.
   * - Extracts error messages from the `err.error` object, which can contain:
   *   - Arrays of error messages.
   *   - Single string error messages.
   * - Updates the `errorMessages` property of the `errorService` with the extracted messages.
   */
  requestError(err: any): void {
    console.error(err);
    this.showLoadingSpinner = false;
    let errorMessages: string[] = [];
    const errors = err.error;
    for (const key in errors) {
      if (Array.isArray(errors[key])) {
        errorMessages.push(...errors[key]);
      } else if (typeof errors[key] === 'string') {
        errorMessages.push(errors[key]);
      }
    }
    this.errorService.errorMessages = errorMessages;
  }

  /**
   * Resets all form data objects to their initial empty state.
   * 
   * This method clears the following data objects:
   * - `loginData`: Resets `email` and `password` fields to empty strings.
   * - `registrationData`: Resets `email`, `password`, and `repeated_password` fields to empty strings.
   * - `forgotPasswordData`: Resets the `email` field to an empty string.
   * - `resetPasswordData`: Resets `password` and `repeated_password` fields to empty strings.
   */
  clearFormData():void {
    this.loginData = {
      email: '',
      password: ''
    };
    this.registrationData = {
      email: '',
      password: '',
      repeated_password: ''
    };
    this.forgotPasswordData = {
      email: ''
    };
    this.resetPasswordData = {
      password: '',
      repeated_password: ''
    };
  }

  /**
   * Toggles the visibility of a password or confirm password field.
   * 
   * @param passwordType - A string indicating the type of password field. Use 'password' for the main password field or any other string for the confirm password field.
   */
  togglePasswordVisibility(passwordType: string): void {
    if (passwordType === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /**
   * Checks if the password and confirmPassword fields match.
   * 
   * @returns {boolean} - Returns `false` if both fields are non-empty and match, otherwise returns `true`.
   */
  checkPasswords(): boolean {
    if (this.resetPasswordData.password != '' && this.resetPasswordData.repeated_password != '') {
      if (this.resetPasswordData.password === this.resetPasswordData.repeated_password) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  /**
   * Checks if the given string contains only numeric characters.
   *
   * @param value - The string to be validated.
   * @returns `true` if the string consists only of numeric characters, otherwise `false`.
   */
  onlyNumbers(value: string): boolean {
    return /^\d+$/.test(value);
  }
}
