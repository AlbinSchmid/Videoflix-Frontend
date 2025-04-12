import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ApiService } from '../shared/services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryComponent } from './category/category.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-browse',
  imports: [
    HeaderComponent,
    MatButtonModule,
    MatIconModule,
    CategoryComponent,
    FormsModule,
    CommonModule,
    CategoryComponent
  ],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent {
  apiService = inject(ApiService);
  moviesEndpoint: string = 'movies/';

  movieSections: any[] = [];
  randomMovie: any = {};


  ngOnInit() {
    this.sendGetRequest();
    this.getRandomMovie()
  }

  getRandomMovie(): void {
    if (this.movieSections.length != 0) {
      let randomIndex = Math.floor(Math.random() * this.movieSections.length);
      let randomCategory = this.movieSections[randomIndex];
      let randomMovieIndex = Math.floor(Math.random() * randomCategory.movies.length);
      this.randomMovie = randomCategory.movies[randomMovieIndex];
    }
  }


  sendGetRequest() {
    this.apiService.getData(this.moviesEndpoint).subscribe(
      (response) => {
        console.log('GET request successful:', response);
        this.movieSections = Object.entries(response as { [genre: string]: any[] })
          .filter(([_, movies]) => movies.length > 0)
          .map(([genre, movies]) => ({ genre, movies }));
      },
      (error) => {
        console.error('GET request failed:', error);
      }
    )
  }
}
