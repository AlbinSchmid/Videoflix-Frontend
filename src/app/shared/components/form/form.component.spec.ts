import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormComponent } from './form.component';
import { ApiService } from '../../services/api.service';
import { ErrorService } from '../../services/error.service';
import { of, throwError } from 'rxjs';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let errorServiceSpy: jasmine.SpyObj<ErrorService>;
  let formMock: any;

  beforeEach(async () => {
    formMock = { valid: true };
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['postData']);
    errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleError']);
    apiServiceSpy.postData.and.returnValue(of({ message: 'Success' }));


    await TestBed.configureTestingModule({

      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        provideHttpClient(withInterceptorsFromDi())
      ],
      imports: [FormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values and call setEmailFromLandingPage on ngOnInit', () => {
    component.resetPasswordUrlData = { uid: '123', token: 'abc' };
    spyOn(component, 'setEmailFromLandingPage');
    component.ngOnInit();
    expect(component.resetPasswordData.uid).toBe('123');
    expect(component.resetPasswordData.token).toBe('abc');
    expect(component.setEmailFromLandingPage).toHaveBeenCalled();
  });

  it('should set registration email from landing page', () => {
    component.signupEmail = 'signup@gmail.com'
    component.setEmailFromLandingPage();
    expect(component.registrationData.email).toBe('signup@gmail.com');
  });

  it('should set login email from landing page', () => {
    component.loginEmail = 'signup@gmail.com'
    component.setEmailFromLandingPage();
    expect(component.loginData.email).toBe('signup@gmail.com');
  });

  it('should call sendPostRequest if form is valid and no password check', () => {
    spyOn(component, 'sendPostRequest');
    component.submitForm(formMock, '/endpoint', { foo: 'bar' }, false);

    expect(component.showError).toBeFalse();
    expect(component.sendPostRequest).toHaveBeenCalledWith('/endpoint', { foo: 'bar' }, formMock);
  });

  it('should set showError to true if form is invalid', () => {
    formMock.valid = false;
    spyOn(component, 'sendPostRequest');

    component.submitForm(formMock, '/endpoint', { foo: 'bar' });

    expect(component.showError).toBeTrue();
    expect(component.sendPostRequest).not.toHaveBeenCalled();
  });

  it('should not call sendPostRequest if passwords do not match', () => {
    component.resetPasswordData = {
      uid: '123',
      token: 'abc',
      password: '1234',
      repeated_password: '5678'
    };
    spyOn(component, 'sendPostRequest');

    component.submitForm(formMock, '/endpoint', { foo: 'bar' }, true);

    expect(component.showError).toBeTrue();
    expect(component.sendPostRequest).not.toHaveBeenCalled();
  });

  it('should call sendPostRequest if passwords match and form is valid', () => {
    component.resetPasswordData = {
      uid: '123',
      token: 'abc',
      password: '1234',
      repeated_password: '1234'
    };
    spyOn(component, 'sendPostRequest');
    component.submitForm(formMock, '/endpoint', { foo: 'bar' }, true);

    expect(component.showError).toBeFalse();
    expect(component.sendPostRequest).toHaveBeenCalledWith('/endpoint', { foo: 'bar' }, formMock);
  });

  it('should handle successful response in sendPostRequest', () => {
    spyOn(component, 'requestSuccess');
    formMock = {
      reset: jasmine.createSpy('reset')
    };
    component.sendPostRequest('/endpoint', { foo: 'bar' }, formMock);
    expect(component.requestSuccess).toHaveBeenCalledWith({ message: 'Success' });
    expect(apiServiceSpy.postData).toHaveBeenCalledWith('/endpoint', { foo: 'bar' });
  });

  it('should handle error response in sendPostRequest', () => {
    const errorResponse = { error: 'Error' };
    apiServiceSpy.postData.and.returnValue(throwError(() => errorResponse));
    spyOn(component, 'requestError');
    component.sendPostRequest('/endpoint', { foo: 'bar' }, formMock);
    expect(component.requestError).toHaveBeenCalledWith(errorResponse);
  });

  it('call getSuccessOrErrorMessages and put visibily password to false on requestSuccess', () => {
    spyOn(component, 'getSuccessOrErrorMessages');
    component.requestSuccess(['SUCCESS']);

    expect(component.showPassword).toBe(false)
    expect(component.showRepeatedPassword).toBe(false)
    expect(component.showLoadingSpinner).toBe(false)
    expect(component.getSuccessOrErrorMessages).toHaveBeenCalledWith(['SUCCESS'], 'success');
  });

  it('should safe handle error in getSuccessOrErrorMessages', () => {
    component.getSuccessOrErrorMessages(['Error'], 'error');
    expect(component.errorService.errorMessages).toEqual(['Error']);
    expect(component.errorService.successMessages).toEqual([]);
  });

  it('should safe handle success message in getSuccessOrErrorMessages', () => {
    component.getSuccessOrErrorMessages(['Success'], 'success');
    expect(component.errorService.errorMessages).toEqual([]);
    expect(component.errorService.successMessages).toEqual(['Success']);
  });

  it('should change password visibility', () => {
    component.togglePasswordVisibility('password');
    expect(component.showPassword).toBe(true);
  });

  it('should change confirm password visibility', () => {
    component.togglePasswordVisibility('confirmPassword');
    expect(component.showRepeatedPassword).toBe(true);
  });

  it('return false if password and repeated password are same', () => {
    component.resetPasswordData = {
      uid: '123',
      token: 'abc',
      password: '1234',
      repeated_password: '1234'
    };
    const result = component.checkResetPasswords();
    expect(result).toBe(false);
  });

  it('return true if password and repeated password are not the same', () => {
    component.resetPasswordData = {
      uid: '123',
      token: 'abc',
      password: '1234',
      repeated_password: '4321'
    };
    const result = component.checkResetPasswords();
    expect(result).toBe(true);
  });

  it('return true if one password is empty', () => {
    component.resetPasswordData = {
      uid: '123',
      token: 'abc',
      password: '',
      repeated_password: '4321'
    };
    const result = component.checkResetPasswords();
    expect(result).toBe(true);
  });

  it('should return true for numeric string', () => {
    const result = component.onlyNumbers('12345');
    expect(result).toBe(true);
  });

  it('should return false for non-numeric string', () => {
    const result = component.onlyNumbers('123a5');
    expect(result).toBe(false);
  });





});
