import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LogoutComponent } from '../logout/logout.component';
import { Korisnik } from '../../models/korisnik';

@Component({
  selector: 'app-vlasnik_statistika',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, LogoutComponent],
  templateUrl: './vlasnik_statistika.component.html',
  styleUrl: './vlasnik_statistika.component.css'
})
export class VlasnikStatistikaComponent implements OnInit {

  private userService = inject(UserService)
  private backendUrl = 'http://localhost:4000';

  ulogovan: Korisnik = new Korisnik();
  
  ngOnInit(): void {
    let korisnik = localStorage.getItem('ulogovan');
    if (korisnik != null) {
      this.ulogovan = JSON.parse(korisnik);
    }
  }

  getStatistikaSlikaUrl(): string {
    return `${this.backendUrl}/slike/statistika.png`;
  }

}
