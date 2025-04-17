import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [
    CommonModule
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  showPopcorn = false;
  popcorns = Array(10);
  private popcornTimeout: any;

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Initializes the `showPopcorn` property to `false` and sets a timeout to update it to `true` after 5 seconds.
   * This is used to control the visibility of a popcorn animation or element.
   */
  ngOnInit(): void {
    this.showPopcorn = false;
    this.popcornTimeout = setTimeout(() => {
      this.showPopcorn = true;
    }, 5000);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Clears the `popcornTimeout` to prevent memory leaks or unintended behavior
   * if the timeout is still pending when the component is removed.
   */
  ngOnDestroy(): void {
    clearTimeout(this.popcornTimeout);
  }
}
