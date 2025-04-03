import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { DeferBlockBehavior } from '@angular/core/testing';

@Component({
  selector: 'app-form',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  apiService = inject(ApiService)
  @Input() formType: string = '';
  @Input() signupEmail: string = '';
  @Output() errorMessage = new EventEmitter<string>();

  loginEndpoint: string = 'login/'
  registrationEndpoint: string = 'registraion/'
  password: string = '';
  confirmPassword: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  registrationError: boolean = false;

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

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * This method checks if the `signupEmail` property is not an empty string.
   * If it contains a value, it assigns that value to the `email` property
   * of the `registrationData` object.
   */
  ngOnInit(): void {
    if (this.signupEmail !== '') {
      this.registrationData.email = this.signupEmail;
    }
  }

  /**
   * Submits the login form by sending the login data to the specified endpoint.
   *
   * @param form - The form object containing the login details.
   */
  submitLoginForm(form: any) {
    this.apiService.postData(this.loginEndpoint, this.loginData)
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
  submitRegistrationForm(form: any) {
    if (form.valid) {
      this.registrationError = false;
      this.sendPostRequest(this.registrationEndpoint, this.registrationData);
    } else {
      this.registrationError = true;
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
  sendPostRequest(endpoint: string, data: object) {
    this.apiService.postData(endpoint, data).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error(error);
        let errorMessageRegistration = error.error['non_field_errors'][0];
        this.errorMessage.emit(errorMessageRegistration);
      }
    })
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
    if (this.password != '' && this.confirmPassword != '') {
      if (this.password === this.confirmPassword) {
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
