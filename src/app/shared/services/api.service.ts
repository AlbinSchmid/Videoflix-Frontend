import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  http = inject(HttpClient)

  API_BASE_URL = 'http://localhost:8000/api/';

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

  /**
   * Sends a POST request to the specified endpoint with the provided data.
   * This method is typically used for login or logout operations.
   *
   * @param endpoint - The API endpoint to which the POST request will be sent.
   * @param data - The payload to be sent in the body of the POST request.
   * @returns An Observable that emits the response from the server.
   */
  postLoginOrLogouData(endpoint: string, data: object): Observable<any> {
    return this.http.post(this.API_BASE_URL + endpoint, data, { withCredentials: true });
  }

  /**
   * Fetches data from the specified API endpoint.
   *
   * @param endpoint - The relative path of the API endpoint to fetch data from.
   * @returns An Observable that emits the response data from the API.
   */
  getData(endpoint: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + endpoint);
  }

  /**
   * Sends a GET request to check if the user is logged in.
   * 
   * @returns {Observable<any>} An observable that emits the server's response.
   * The response typically indicates whether the user is authenticated.
   * 
   * @remarks
   * This method includes credentials (e.g., cookies) in the request to ensure
   * proper authentication handling.
   */
  getCheckLoggedin(): Observable<any> {
    return this.http.get(this.API_BASE_URL + 'logged/', { withCredentials: true });
  }

  /**
   * Fetches data from the specified API endpoint using a provided slug.
   *
   * @param endpoint - The API endpoint to which the request will be made.
   * @param slug - The slug to append to the endpoint for the request.
   * @returns An Observable that emits the response data from the HTTP GET request.
   */
  getDataWithSlug(endpoint: string, slug: string): Observable<any> {
    return this.http.get(this.API_BASE_URL + endpoint + slug);
  }
}
