import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent } from '../shared/components/form/form.component';


@Component({
  selector: 'app-log-in',
  imports: [
    HeaderComponent,
    FooterComponent,
    FormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
}
