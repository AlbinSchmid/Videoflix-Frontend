import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-not-found',
  imports: [
    HeaderComponent,
    MatButtonModule,
    FooterComponent
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

}
