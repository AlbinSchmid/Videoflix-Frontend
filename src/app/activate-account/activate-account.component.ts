import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-activate-account',
  imports: [
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss'
})
export class ActivateAccountComponent implements OnInit {
  route = inject(ActivatedRoute);
  apiService = inject(ApiService);
  endpoint: string = 'activate/';

  message: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * If the application is running in a browser environment, it triggers the user verification process.
   * This ensures that platform-specific logic is executed only on the client side.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.verifyUser();
    }
  }

  /**
   * Verifies the user by extracting the `uid` and `token` parameters from the route's snapshot
   * and sending them as a request payload.
   *
   * This method retrieves the `uid` and `token` from the URL parameters, constructs a data object,
   * and passes it to the `sendRequest` method for further processing.
   *
   * @returns {void} This method does not return a value.
   */
  verifyUser(): void {
    const uid = this.route.snapshot.paramMap.get('uid')
    const token = this.route.snapshot.paramMap.get('token')
    const data = {
      'uid': uid,
      'token': token
    }
    this.sendRequest(data)
  }

  /**
   * Sends a POST request to the specified endpoint with the provided data.
   * Subscribes to the API response and handles both success and error cases.
   *
   * @param data - The payload to be sent in the POST request.
   * 
   * On success:
   * - Updates the `message` property with the response message.
   * - Logs the response to the console.
   * 
   * On error:
   * - Updates the `message` property with the error detail from the response.
   * - Logs the error to the console.
   */
  sendRequest(data: Object): void {
    this.apiService.postData(this.endpoint, data).subscribe({
      next: (res) => {
        this.message = res.message
      },
      error: (err) => {
        this.message = err.error['detail']
        console.error(err);
      }
    });
  }
}


