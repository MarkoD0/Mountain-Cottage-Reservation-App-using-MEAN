import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Korisnik } from '../../models/korisnik';
import { LogoutComponent } from '../logout/logout.component';
import { ProfilComponent } from '../profil/profil.component';
import { TuristaVikendiceComponent } from '../turista_vikendice/turista_vikendice.component';
import { TuristaRezervacijeComponent } from '../turista_rezervacije/turista_rezervacije.component';

@Component({
  selector: 'app-turista',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, CommonModule, LogoutComponent, RouterOutlet, ProfilComponent, TuristaVikendiceComponent, TuristaRezervacijeComponent],
  templateUrl: './turista.component.html',
  styleUrl: './turista.component.css'
})
export class TuristaComponent implements OnInit {

  private userService = inject(UserService)
  private router = inject(Router)

  ulogovan: Korisnik = new Korisnik();

  aktivnaStavka: string = 'profil';

  ngOnInit(): void {
    let korisnik = localStorage.getItem('ulogovan');
    if (korisnik != null) this.ulogovan = JSON.parse(korisnik);

    this.aktivnaStavka = 'profil';
  }

  promeniStavku(stavka: string): void {
    this.aktivnaStavka = stavka;
  }

}
