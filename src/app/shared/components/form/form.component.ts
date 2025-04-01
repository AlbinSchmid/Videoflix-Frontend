import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

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
  @Input() formType: string = '';

  password: string = '';
  confirmPassword: string = '';
  email: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;



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
