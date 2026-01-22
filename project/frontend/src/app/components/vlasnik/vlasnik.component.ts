import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Korisnik } from '../../models/korisnik';
import { LogoutComponent } from '../logout/logout.component';
import { ProfilComponent } from '../profil/profil.component';
import { VlasnikVikendiceComponent } from '../vlasnik_vikendice/vlasnik_vikendice.component';
import { VlasnikRezervacijeComponent } from '../vlasnik_rezervacije/vlasnik_rezervacije.component';
import { VlasnikStatistikaComponent } from '../vlasnik-statistika/vlasnik_statistika.component';


@Component({
  selector: 'app-vlasnik',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, CommonModule, LogoutComponent, RouterOutlet, ProfilComponent, VlasnikVikendiceComponent, VlasnikRezervacijeComponent, VlasnikStatistikaComponent],
  templateUrl: './vlasnik.component.html',
  styleUrl: './vlasnik.component.css'
})
export class VlasnikComponent implements OnInit {

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
