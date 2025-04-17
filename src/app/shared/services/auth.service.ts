import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';
import { ErrorService } from './error.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router = inject(Router);
  apiService = inject(ApiService);
  errorService = inject(ErrorService);
  isAuthenticated = false;
  isLoading = false;

  /**
   * Initializes the authentication state of the application.
   * 
   * This method checks if the user is currently logged in by making a request
   * to the API service. If the user is authenticated, the `isAuthenticated` 
   * property is set to `true`. Otherwise, it is set to `false`.
   * 
   * The `isLoading` property is set to `false` once the initialization process
   * is complete, regardless of the authentication result.
   * 
   * @returns A promise that resolves when the initialization process is complete.
   */
  async init(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.getCheckLoggedin());
      this.isAuthenticated = true;
    } catch (error) {
      const err = error as HttpErrorResponse;
      this.errorService.getSuccessOrErrorMessages(err.error, 'error');
      this.isAuthenticated = false;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}
