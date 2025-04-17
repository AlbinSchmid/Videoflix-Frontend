import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { ErrorService } from './error.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let errorServiceSpy: jasmine.SpyObj<ErrorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCheckLoggedin']);
    errorServiceSpy = jasmine.createSpyObj('ErrorService', ['getSuccessOrErrorMessages']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        { provide: Router, useValue: routerSpy },
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should set isAuthenticated = true and isLoading = false on successful init', async () => {
    apiServiceSpy.getCheckLoggedin.and.returnValue(of({ foo: 'bar' }));

    await service.init();

    expect(service.isAuthenticated).toBeTrue();
    expect(service.isLoading).toBeFalse();
    expect(apiServiceSpy.getCheckLoggedin).toHaveBeenCalled();
    expect(errorServiceSpy.getSuccessOrErrorMessages).not.toHaveBeenCalled();
  });

  it('should set isAuthenticated = false, call errorService and rethrow on error', async () => {
    const httpError = new HttpErrorResponse({ error: { message: 'fail' } });
    apiServiceSpy.getCheckLoggedin.and.returnValue(throwError(() => httpError));

    await expectAsync(service.init()).toBeRejectedWith(httpError);
    expect(service.isAuthenticated).toBeFalse();
    expect(service.isLoading).toBeFalse();
    expect(errorServiceSpy.getSuccessOrErrorMessages)
      .toHaveBeenCalledOnceWith(httpError.error, 'error');
  });
});