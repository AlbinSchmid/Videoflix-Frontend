import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  http = inject(HttpClient)

  API_BASE_URL = 'http://127.0.0.1:8000/api/';

  postData(endpoint: string, data: object): Observable<any> {
    return this.http.post(this.API_BASE_URL + endpoint, data);
  }
}
