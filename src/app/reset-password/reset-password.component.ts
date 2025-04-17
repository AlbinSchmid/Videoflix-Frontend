import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { FormComponent } from '../shared/components/form/form.component';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-reset-password',
  imports: [
    HeaderComponent,
    FooterComponent,
    FormComponent,
    ErrorMessageComponent,
    CommonModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  router = inject(ActivatedRoute);
  apiService = inject(ApiService);

  endpoint: string = 'reset-password/';
  checkTokenEndpoint: string = 'check-reset-password-token/';
  error: string | null = null;

  data: {uid: string | null, token: string | null} = {
    uid: '',
    token: '',
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * 
   * In this implementation, it checks if the platform is a browser environment and retrieves the `uid` 
   * and `token` parameters from the route's snapshot. These parameters are then assigned to the `data` object.
   * 
   * This method is typically used for initialization logic that depends on the component's inputs or 
   * other services.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.data.uid = this.router.snapshot.paramMap.get('uid');
      this.data.token = this.router.snapshot.paramMap.get('token');
      this.sendPostRequest();
    }
  }

  /**
   * Sends a POST request to the specified endpoint with the provided data.
   * Subscribes to the response and handles success and error cases.
   *
   * @remarks
   * - On success, clears the error message.
   * - On error, logs the error to the console and processes it using `getError`.
   *
   * @returns {void} This method does not return a value.
   */
  sendPostRequest(): void {
    this.apiService.postData(this.checkTokenEndpoint, this.data).subscribe({
      next: (res) => {
        this.error = '';
      },
      error: (err) => {
        console.error(err)
        this.getError(err)
      }
    })
  }

  /**
   * Extracts and assigns the first string error message from the provided error object.
   *
   * @param err - The error object, typically containing an `error` property with key-value pairs.
   *              The method iterates over the keys of `err.error` and assigns the first string value
   *              it encounters to the `error` property of the component.
   */
  getError(err: any): void {
    for (const key in err.error) {
      if (typeof err.error[key] === 'string') {
        this.error = err.error[key]
      }
    }
  }
}
