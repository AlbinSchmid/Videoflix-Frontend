import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogInComponent } from './log-in.component';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '../shared/services/error.service';
import { BehaviorSubject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockErrorService {
  errorMessages: string[] = [];
  successMessages: string[] = [];
}

describe('LogInComponent', () => {
  let component: LogInComponent;
  let fixture: ComponentFixture<LogInComponent>;
  let queryParamsSubject: BehaviorSubject<any>;
  let activatedRoute: { queryParams: BehaviorSubject<any> };

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject({ email: 'initial@example.com' });
    activatedRoute = { queryParams: queryParamsSubject };

    await TestBed.configureTestingModule({
      imports: [LogInComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LogInComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set email from queryParams on init', () => {
    expect(component.email).toBe('');

    component.ngOnInit();
    expect(component.email).toBe('initial@example.com');

    queryParamsSubject.next({ email: 'updated@example.com' });
    expect(component.email).toBe('updated@example.com');
  });
});
