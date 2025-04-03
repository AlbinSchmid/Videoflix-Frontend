import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-message',
  imports: [
    MatIconModule
  ],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
@Input() errorMessage: string = '';
@Output() closeErrorMessage = new EventEmitter<string>();

  close() {
    this.closeErrorMessage.emit('');
  }
}
