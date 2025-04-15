import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivateAccountComponent } from "../../../activate-account/activate-account.component";
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

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
  @Input() login: boolean = false;
  @Input() browse: boolean = false;


  logout(): void {
    this.apiService.postLoginOrLogouData('logout/', {}).subscribe((response) => {
      console.log(response);
      this.router.navigate(['/']);
    }, (error) => {
      console.log(error);
    });
  }
}
