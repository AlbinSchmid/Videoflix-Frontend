import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errorMessages: string[] = []

  /**
 * Updates the component's error messages with the provided array of error messages.
 *
 * @param errorMessages - An array of strings representing the error messages to be displayed.
 */
  getErrors(errorMessages: Array<string>): void {
    this.errorMessages = errorMessages;
  }
}
