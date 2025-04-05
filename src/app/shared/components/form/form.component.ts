import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Form, FormsModule, NgForm } from '@angular/forms';
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
  @Input() resetPasswordUrlData: any = {
    uid: null,
    token: null
  };


  loginEndpoint: string = 'login/';
  registrationEndpoint: string = 'registraion/';
  forgotPasswordEndpoint: string = 'forgot-password/';
  resetPasswordEndpoint: string = 'reset-password/';

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
    uid: '',
    token: '',
    password: '',
    repeated_password: ''
  }


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * This method is used to perform component initialization logic.
   * Specifically, it sets the email address from the landing page into the form.
   */
  ngOnInit(): void {
    if (Object.keys(this.resetPasswordUrlData).length > 0) {
      this.resetPasswordData.uid = this.resetPasswordUrlData.uid;
      this.resetPasswordData.token = this.resetPasswordUrlData.token
    }
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
   * Handles the submission of a form by validating its data and sending a POST request to the specified endpoint.
   *
   * @param form - The Angular `NgForm` instance containing the form data to be submitted.
   * @param endpoint - The API endpoint to which the form data should be sent.
   * @param data - An object containing the data to be sent in the POST request.
   * @param checkPasswordMatch - Optional. A boolean indicating whether to validate that the password and repeated password match.
   *                              Defaults to `false`.
   *
   * The method performs the following steps:
   * 1. Validates the form's validity and, if `checkPasswordMatch` is `true`, ensures the password and repeated password match.
   * 2. If the form is valid, it hides any error messages and sends a POST request using the provided endpoint and data.
   * 3. If the form is invalid, it displays an error message.
   */
  submitForm(form: NgForm, endpoint: string, data: object, checkPasswordMatch: boolean = false): void {
    const isValid = form.valid && (!checkPasswordMatch || this.resetPasswordData.password === this.resetPasswordData.repeated_password);
    if (isValid) {
      this.showError = false;
      this.sendPostRequest(endpoint, data, form);
    } else {
      this.showError = true;
    }
  }

  /**
   * Sends a POST request to the specified endpoint with the provided data and handles the response.
   * Displays a loading spinner while the request is in progress.
   * Resets the form upon a successful response.
   * 
   * @param endpoint - The API endpoint to which the POST request will be sent.
   * @param data - The data object to be sent in the body of the POST request.
   * @param form - The Angular form to be reset after a successful request.
   */
  sendPostRequest(endpoint: string, data: object, form: NgForm): void {
    this.showLoadingSpinner = true;
    this.apiService.postData(endpoint, data).subscribe({
      next: (res) => {
        this.requestSuccess(res);
        form.reset();
      },
      error: (err) => {
        this.requestError(err);
      }
    })
  }

  /**
   * Handles the successful response of a request.
   *
   * @param res - The response object returned from the request.
   * Logs the response to the console, hides the loading spinner,
   * and processes success or error messages based on the response.
   */
  requestSuccess(res: any): void {
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.showLoadingSpinner = false;
    this.getSucessOrErrorMessages(res, 'success');
  }

  /**
   * Handles errors from HTTP requests by logging the error, hiding the loading spinner,
   * and processing error messages to display them appropriately.
   *
   * @param err - The error object received from the HTTP request. It is expected to contain
   *              an `error` property with the details of the error.
   */
  requestError(err: any): void {
    console.error(err);
    const errors = err.error;
    this.getSucessOrErrorMessages(errors, 'error');
    this.showLoadingSpinner = false;
  }

  /**
   * Processes an array of messages and categorizes them as either error or success messages
   * based on the specified type. Updates the `errorMessages` or `successMessages` properties
   * of the `errorService` accordingly.
   *
   * @param messages - An array of messages to be processed. Each message can either be a string
   *                   or an array of strings.
   * @param type - A string indicating the type of messages to process. Should be either `'error'`
   *               or `'success'`.
   */
  getSucessOrErrorMessages(messages: string[], type: string): void {
    this.errorService.errorMessages = []
    this.errorService.successMessages = []
    for (const key in messages) {
      if (Array.isArray(messages[key])) {
        type === 'error' ? this.errorService.errorMessages.push(...messages[key]) : this.errorService.successMessages.push(...messages[key]);
      } else if (typeof messages[key] === 'string') {
        type === 'error' ? this.errorService.errorMessages.push(messages[key]) : this.errorService.successMessages.push(messages[key]);
      }
    }
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
  checkResetPasswords(): boolean {
    if (this.resetPasswordData.password != '' && this.resetPasswordData.repeated_password != '') {
      return this.resetPasswordData.password === this.resetPasswordData.repeated_password ? false : true;
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
