import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent } from '../shared/components/form/form.component';
import { CommonModule } from '@angular/common';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { ErrorService } from '../shared/services/error.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-log-in',
  imports: [
    HeaderComponent,
    FooterComponent,
    ErrorMessageComponent,
    FormComponent,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  router = inject(ActivatedRoute);
  errorService = inject(ErrorService);
  email: string = '';

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Subscribes to query parameters from the router to retrieve the 'email' parameter
   * and assigns it to the `email` property of the component.
   */
  ngOnInit(): void {
    this.router.queryParams.subscribe(params => {
      this.email = params['email']
    })
  }
}
