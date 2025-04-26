import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormComponent } from './form.component';
import { ApiService } from '../../services/api.service';
import { ErrorService } from '../../services/error.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let errorSpy: jasmine.SpyObj<ErrorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['postLoginOrLogouData', 'postData']);
    errorSpy = jasmine.createSpyObj('ErrorService', ['getSuccessOrErrorMessages']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: ErrorService, useValue: errorSpy },
        { provide: Router, useValue: routerSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should populate resetPasswordData from resetPasswordUrlData on init', () => {
    const urlData = { uid: '123', token: 'abc' };
    component.resetPasswordUrlData = urlData;
    component.ngOnInit();
    expect(component.resetPasswordData.uid).toBe('123');
    expect(component.resetPasswordData.token).toBe('abc');
  });

  it('setEmailFromLandingPage() should prioritize signupEmail', () => {
    component.signupEmail = 'a@b.com';
    component.loginEmail = 'c@d.com';
    component.setEmailFromLandingPage();
    expect(component.registrationData.email).toBe('a@b.com');
    expect(component.loginData.email).toBe('');
  });

  it('setEmailFromLandingPage() should use loginEmail when no signupEmail', () => {
    component.signupEmail = '';
    component.loginEmail = 'user@site.com';
    component.setEmailFromLandingPage();
    expect(component.loginData.email).toBe('user@site.com');
  });

  it('togglePasswordVisibility toggles showPassword and showRepeatedPassword', () => {
    component.showPassword = false;
    component.togglePasswordVisibility('password');
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility('password');
    expect(component.showPassword).toBeFalse();

    component.showRepeatedPassword = false;
    component.togglePasswordVisibility('other');
    expect(component.showRepeatedPassword).toBeTrue();
  });

  it('checkResetPasswords() returns false when passwords match and not empty', () => {
    component.resetPasswordData.password = '123';
    component.resetPasswordData.repeated_password = '123';
    expect(component.checkResetPasswords()).toBeFalse();
  });

  it('checkResetPasswords() returns true when empty or different', () => {
    component.resetPasswordData.password = '';
    component.resetPasswordData.repeated_password = '';
    expect(component.checkResetPasswords()).toBeTrue();

    component.resetPasswordData.password = 'a';
    component.resetPasswordData.repeated_password = 'b';
    expect(component.checkResetPasswords()).toBeTrue();
  });

  it('onlyNumbers() recognizes only numeric strings', () => {
    expect(component.onlyNumbers('12345')).toBeTrue();
    expect(component.onlyNumbers('12a45')).toBeFalse();
    expect(component.onlyNumbers('')).toBeFalse();
  });

  describe('submitLogInForm', () => {
    it('should set showError=false & call sendLogInRequest on valid form', () => {
      const fakeForm = { valid: true } as unknown as NgForm;
      spyOn(component, 'sendLogInRequest');
      component.showError = true;

      component.submitLogInForm(fakeForm);

      expect(component.showError).toBeFalse();
      expect(component.sendLogInRequest).toHaveBeenCalledWith(component.loginData);
    });

    it('should set showError=true & not call sendLogInRequest on invalid form', () => {
      const fakeForm = { valid: false } as unknown as NgForm;
      spyOn(component, 'sendLogInRequest');
      component.showError = false;

      component.submitLogInForm(fakeForm);

      expect(component.showError).toBeTrue();
      expect(component.sendLogInRequest).not.toHaveBeenCalled();
    });
  });

  describe('sendLogInRequest', () => {
    const resMock = { token: 'xyz' };
    const errMock = { error: { msg: 'fail' } };

    it('should call requestSuccess and navigate on success', fakeAsync(() => {
      apiSpy.postLoginOrLogouData.and.returnValue(of(resMock));
      spyOn(component, 'requestSuccess').and.callThrough();

      component.sendLogInRequest(component.loginData);
      tick();

      expect(component.requestSuccess).toHaveBeenCalledWith(resMock);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/browse']);
      expect(component.showLoadingSpinner).toBeFalse();
    }));

    it('should call requestError on error', fakeAsync(() => {
      apiSpy.postLoginOrLogouData.and.returnValue(throwError(() => errMock));
      spyOn(component, 'requestError').and.callThrough();

      component.sendLogInRequest(component.loginData);
      tick();

      expect(component.requestError).toHaveBeenCalledWith(errMock);
      expect(component.showLoadingSpinner).toBeFalse();
    }));
  });

  describe('sendPostRequest', () => {
    const successRes = { data: 'ok' };
    const errorRes = { error: { detail: 'nope' } };
    const fakeForm = { reset: jasmine.createSpy('reset') } as unknown as NgForm;

    it('should reset form and navigate on reset-password endpoint success', fakeAsync(() => {
      apiSpy.postData.and.returnValue(of(successRes));
      spyOn(component, 'requestSuccess').and.callThrough();

      component.sendPostRequest(component.resetPasswordEndpoint, component.resetPasswordData, fakeForm);
      tick();

      expect(component.requestSuccess).toHaveBeenCalledWith(successRes);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      expect(fakeForm.reset).toHaveBeenCalled();
      expect(component.showLoadingSpinner).toBeFalse();
    }));

    it('should call requestError on error', fakeAsync(() => {
      apiSpy.postData.and.returnValue(throwError(() => errorRes));
      spyOn(component, 'requestError').and.callThrough();

      component.sendPostRequest('anything', {}, fakeForm);
      tick();

      expect(component.requestError).toHaveBeenCalledWith(errorRes);
      expect(component.showLoadingSpinner).toBeFalse();
    }));
  });
});
