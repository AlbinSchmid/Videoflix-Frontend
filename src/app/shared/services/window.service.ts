import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  isBrowser: boolean;
  widthSubject = new BehaviorSubject<number>(0);
  width = this.widthSubject.asObservable();

  /**
   * Initializes the WindowService by determining if the code is running in a browser environment.
   * If running in a browser, it sets up an observable to track the window's width and emits updates
   * whenever the window is resized.
   *
   * - `isBrowser`: A boolean indicating whether the code is running in a browser environment.
   * - `widthSubject`: An observable that emits the current window width.
   *
   * Subscribes to the `resize` event of the `window` object to update the `widthSubject` with the
   * latest window width whenever the window is resized.
   */
  constructor() {
    this.isBrowser = typeof window !== 'undefined';

    if (this.isBrowser) {
      this.widthSubject.next(window.innerWidth);
      fromEvent(window, 'resize').subscribe(() => {
        this.widthSubject.next(window.innerWidth);
      });
    }
  }
}
