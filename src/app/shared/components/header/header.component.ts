import { CommonModule, Location } from '@angular/common';
import { Component ,inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  apiService = inject(ApiService);
  router = inject(Router)
  location = inject(Location)
  windowService = inject(WindowService);
  @Input() login: boolean = false;
  @Input() browse: boolean = false;
  @Input() legalNoticeOrPrivacyPolicy: boolean = false;
  windowWidth: number = 0;

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

  /**
   * Logs the user out by sending a logout request to the API.
   * On successful logout, navigates the user to the home page ('/').
   * If an error occurs during the logout process, it logs the error to the console.
   *
   * @returns {void}
   */
  logout(): void {
    this.apiService.postLoginOrLogouData('logout/', {}).subscribe((response) => {
      this.router.navigate(['/']);
    }, (error) => {
    });
  }

  /**
   * Navigates the user to the previous page in the browser's history.
   * Utilizes the `Location` service to perform the navigation.
   * This method is typically used for implementing a "back" button functionality.
   */
  goToPreviosPage(): void {
    this.location.back();
  }
}
