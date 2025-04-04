import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  http = inject(HttpClient)

  API_BASE_URL = 'http://127.0.0.1:8000/api/';

  /**
   * Sends a POST request to the specified endpoint with the provided data.
   *
   * @param endpoint - The API endpoint to which the POST request will be sent.
   * @param data - The payload to be sent in the body of the POST request.
   * @returns An Observable that emits the response from the server.
   */
  postData(endpoint: string, data: object): Observable<any> {
    return this.http.post(this.API_BASE_URL + endpoint, data);
  }
}
