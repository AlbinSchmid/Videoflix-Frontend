import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errorMessages: string[] = [];
  successMessages: string[] = [];

  /**
 * Processes an array of messages and categorizes them as either error or success messages
 * based on the specified type. Updates the `errorMessages` or `successMessages` properties
 * of the `errorService` accordingly.
 *
 * @param messages - An array of messages to be processed. Each message can either be a string
 *                   or an array of strings.
 * @param type - A string indicating the type of messages to process. Should be either `'error'`
 *               or `'success'`.
 */
  getSuccessOrErrorMessages(messages: string[], type: string): void {
    this.errorMessages = [];
    this.successMessages = [];
    for (const key in messages) {
      if (Array.isArray(messages[key])) {
        type === 'error' ? this.errorMessages.push(...messages[key]) : this.successMessages.push(...messages[key]);
      } else if (typeof messages[key] === 'string') {
        type === 'error' ? this.errorMessages.push(messages[key]) : this.successMessages.push(messages[key]);
      }
    }
  }
}
