import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from '../shared/services/api.service';
import { of, throwError } from 'rxjs';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const routerMock = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'uid') return '12345';
            if (key === 'token') return 'abcdf';
            return null;
          },
        },
      },
    };
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['postData'])
    apiServiceSpy.postData.and.returnValue(of({ message: 'Token is correct' }));


    await TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiServiceSpy},
        { provide: ActivatedRoute, useValue: routerMock},
        provideHttpClient(withInterceptorsFromDi()),
        {
          useValue: {
            snapshot: {
              paramMap: new Map(),
              queryParamMap: new Map(),
            }
          }
        }
      ],
      imports: [ResetPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getData should set uid and token from route params and call sendPostRequest on ngOnInit', () => {
    spyOn(component, 'sendPostRequest');
    component.ngOnInit();
    expect(component.data.uid).toBe('12345');
    expect(component.data.token).toBe('abcdf');
    expect(component.sendPostRequest).toHaveBeenCalled();
  });

  it('call getError when sendPostRequest get error', () => {
    apiServiceSpy.postData.and.returnValue(throwError(() => new Error('Error')));
    spyOn(component, 'getError');
    component.sendPostRequest();
    expect(component.getError).toHaveBeenCalledWith(new Error('Error'));
  });

  it('should set error message on getError', () => {
    let error = { error: { detail: 'Error message' } };
    component.getError(error);
    expect(component.error).toBe('Error message');
  });
});
