import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiService = inject(ApiService) 
  isAuthenticated = false;
  isLoading = true;

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
    } catch {
      this.isAuthenticated = false;
    } finally {
      this.isLoading = false;
    }
  }
}
