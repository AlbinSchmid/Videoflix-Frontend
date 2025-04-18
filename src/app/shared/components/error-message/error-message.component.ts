import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ErrorService } from '../../services/error.service';
import { CommonModule } from '@angular/common';
import { WindowService } from '../../services/window.service';

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
windowService = inject(WindowService);
windowWidth = 0;

/**
 * Lifecycle hook that is called after Angular has initialized the component.
 * Subscribes to the `width$` observable from the `WindowService` to update the
 * `windowWidth` property whenever the window width changes.
 */
ngOnInit(): void {
  this.windowService.width.subscribe(width => {
    this.windowWidth = width;
  });
}
}
