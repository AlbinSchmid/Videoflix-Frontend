import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-form',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  apiService = inject(ApiService)
  @Input() formType: string = '';

  loginEndpoint: string = 'login/'
  registrationEndpoint: string = 'registraion/'
  password: string = '';
  confirmPassword: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

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

  submitLoginForm(form: any) {
    this.apiService.postData(this.loginEndpoint, this.loginData)
  }

  submitRegistrationForm(form: any) {
    this.apiService.postData(this.registrationEndpoint, this.registrationData).subscribe({
      next: (response) => {
        console.log(response)
      },
      error: (error) => {
        console.log(error)
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
}
