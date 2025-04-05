import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ErrorService } from '../../services/error.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  imports: [
    MatIconModule,
    CommonModule
  ],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
errorService = inject(ErrorService);
}
