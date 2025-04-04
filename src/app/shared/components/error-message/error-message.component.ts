import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-error-message',
  imports: [
    MatIconModule
  ],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
errorService = inject(ErrorService);
@Input() errorMessage: string = '';
@Input() errorIndex: number = 0;
}
