import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ErrorService } from '../services/error.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  apiService = inject(ApiService);
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
  canActivate(): Observable<boolean> {
    return this.apiService.getCheckLoggedin().pipe(
      map(() => {
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}