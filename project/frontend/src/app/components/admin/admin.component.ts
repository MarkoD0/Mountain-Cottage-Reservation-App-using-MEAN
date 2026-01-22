import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Korisnik } from '../../models/korisnik';
import { LogoutComponent } from '../logout/logout.component';
import { AdminKorisniciComponent } from '../admin_korisnici/admin_korisnici.component';
import { AdminVikendiceComponent } from '../admin_vikendice/admin_vikendice.component';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, CommonModule, LogoutComponent, AdminKorisniciComponent, AdminVikendiceComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  private userService = inject(UserService)
    private router = inject(Router)

  ulogovan: Korisnik = new Korisnik();

  aktivnaStavka: string = 'korisnici';

  ngOnInit(): void {
    let korisnik = localStorage.getItem('ulogovan');
    if (korisnik != null) this.ulogovan = JSON.parse(korisnik);

    this.aktivnaStavka = 'korisnici';
  }

  promeniStavku(stavka: string): void {
    this.aktivnaStavka = stavka;
  }

}
