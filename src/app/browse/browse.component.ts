import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ApiService } from '../shared/services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-browse',
  imports: [
    HeaderComponent,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent {
  apiService = inject(ApiService);
  moviesEndpoint: string = 'movies/';

  movies = [];


  ngOnInit() {
    this.sendGetRequest();
  }


  sendGetRequest() {
    this.apiService.getData(this.moviesEndpoint).subscribe(
      (response) => {
        this.movies = response;
      },
      (error) => {
        console.error('GET request failed:', error);
      }
    )
  }
}
