import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { BrowseService } from './shared/services/browse.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatProgressSpinnerModule,
    LoadingComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  browseService = inject(BrowseService);
  authService = inject(AuthService);

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * This method is used to perform component initialization logic.
   *
   * In this implementation, it invokes the `isIOS` method from the `browseService`
   * to determine if the application is running on an iOS device.
   *
   * @see https://angular.io/api/core/OnInit
   */
  ngOnInit(): void {
    // this.browseService.onIOS = this.browseService.isIOS();
  }
}
