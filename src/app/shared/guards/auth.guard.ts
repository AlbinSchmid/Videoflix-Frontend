import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  authService = inject(AuthService);
  platformId = inject(PLATFORM_ID)
  errorSerice = inject(ErrorService);
  router = inject(Router);

  /**
   * Determines whether a route can be activated based on the user's authentication status.
   * 
   * This method checks if the user is logged in by calling the `getCheckLoggedin` method
   * from the `apiService`. If the user is authenticated, their information is set in the
   * `authService` and the route activation proceeds. If the user is not authenticated, 
   * they are redirected to the login page and the route activation is denied.
   * 
   * @returns An `Observable<boolean>` that emits `true` if the route can be activated, 
   *          or `false` if the user is redirected to the login page.
   */
  canActivate(): Observable<boolean>  {
    this.authService.isLoading = true;
    return from(this.authService.init()).pipe(
      map(() => {
        return this.authService.isAuthenticated;
      }),
      catchError(err => {
        if (isPlatformBrowser(this.platformId)) {
          this.router.navigate(['/login']);
        }
        return of(false);
      })
    );
  }
}