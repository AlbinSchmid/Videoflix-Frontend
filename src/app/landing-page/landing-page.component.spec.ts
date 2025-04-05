import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LandingPageComponent } from './landing-page.component';
import { ApiService } from '../shared/services/api.service';
import { ErrorService } from '../shared/services/error.service';
import { of, throwError } from 'rxjs';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>
  let errorServiceSpy: jasmine.SpyObj<ErrorService>

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['postData']);
    errorServiceSpy = jasmine.createSpyObj('ErrorService', ['handleError']);
    
    await TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        provideHttpClient(withInterceptorsFromDi())
      ],
      imports: [LandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call sendPostRequest when form is valid', () => {
    const formMock = { valid: true };
    spyOn(component, 'sendPostRequest');
    component.submitForm(formMock);

    expect(component.showLoadingSpinner).toBe(true);
    expect(component.sendPostRequest).toHaveBeenCalled();
  })

  it('should set showEmailError to true when form is invalid and email is empty', () => {
    const formMock = { valid: false};
    component.data.email = '';
    component.submitForm(formMock);
    expect(component.showEmailError).toBe(true);
    expect(component.showLoadingSpinner).toBe(false);
  });

  it('should call requestSucces when sendPostRequest is success', () => {
    const responseMock = { message: 'Success' };
    spyOn(component, 'requestSuccess');
    apiServiceSpy.postData.and.returnValue(of(responseMock));
    component.sendPostRequest();
    expect(component.requestSuccess).toHaveBeenCalledWith(responseMock);
  });

  it('should call requestError when sendPostRequest fails', () => {
    const errorMock = { message: 'Error' };
    apiServiceSpy.postData.and.returnValue(throwError(() => errorMock));
    component.sendPostRequest();
    expect(component.showLoadingSpinner).toBe(false);
  });

  it('should navigate to login and call getSuccessMessages when res.exist is true', () => {
    const resMok = { exist: true};
    const routerSpy = spyOn(component.router, 'navigate');
    spyOn(component, 'getSuccessMessages');
    component.requestSuccess(resMok);
    expect(component.getSuccessMessages).toHaveBeenCalledWith(resMok);
    expect(component.showLoadingSpinner).toBe(false);
    expect(component.showEmailError).toBe(false);
    expect(routerSpy).toHaveBeenCalledWith(['login'], { queryParams: { email: component.data.email } });
  });

  it('should navigate to registration when res.exist is false', () => {
    const resMock = { exist: false };
    const routerSpy = spyOn(component.router, 'navigate');
    component.requestSuccess(resMock);
    expect(component.showLoadingSpinner).toBe(false);
    expect(component.showEmailError).toBe(false);
    expect(routerSpy).toHaveBeenCalledWith(['registration'], { queryParams: { email: component.data.email } });
  });

  it('should get success messages from response', () => {
    const resMock = { message: 'Success' };
    errorServiceSpy.successMessages = [];
    component.getSuccessMessages(resMock);
    expect(errorServiceSpy.successMessages).toContain('Success');
  });
});
