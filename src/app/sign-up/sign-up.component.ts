import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent } from '../shared/components/form/form.component';
import { ActivatedRoute } from '@angular/router';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  imports: [
    HeaderComponent,
    FooterComponent,
    FormComponent,
    MatButtonModule,
    MatIconModule,
    ErrorMessageComponent,
    CommonModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {
  route = inject(ActivatedRoute)
  email: string = ''
  errorMessage: string = ''

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Subscribes to query parameters from the route and assigns the 'email' parameter to the component's email property.
   * 
   * @returns void
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email']
    })
  }
}
