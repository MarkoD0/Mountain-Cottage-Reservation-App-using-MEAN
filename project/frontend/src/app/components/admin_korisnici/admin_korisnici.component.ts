import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Korisnik } from '../../models/korisnik';

@Component({
  selector: 'app-admin_korisnici',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf, NgFor],
  templateUrl: './admin_korisnici.component.html',
  styleUrl: './admin_korisnici.component.css'
})
export class AdminKorisniciComponent implements OnInit {

  private korisnikService = inject(UserService)
  private router = inject(Router);

  sviTuristi: Korisnik[] = [];
  sviVlasnici: Korisnik[] = [];

  admin: Korisnik | null = null;
  porukaDetalji: string = '';
  
  porukaTuristaPretraga: string = "";
  porukaVlasnikPretraga: string = "";

  readonly STATUS_CEKA = 'ceka';
  readonly STATUS_AKTIVAN = 'aktivan';
  readonly STATUS_BLOKIRAN = 'blokiran';
  readonly STATUS_ODBIJEN = 'odbijen';

  ngOnInit(): void {
    let adminData = localStorage.getItem('ulogovan');
    if (adminData) {
      try {
        this.admin = JSON.parse(adminData);
      } catch (e) {
        console.error('Greška pri parsiranju admina iz localStorage-a', e);
        this.admin = null;
      }
    }
    
    this.dohvatiSveTuriste();
    this.dohvatiSveVlasnike();
  }

  dohvatiSveTuriste(): void {
    this.korisnikService.dohvatiSveTuriste().subscribe({
        next: (response) => {
            this.sviTuristi = response;
        },
        error: (err) => {
            console.error('Greska pri dohvatanju svih turista:', err);
            this.porukaTuristaPretraga = 'Doslo je do greske prilikom ucitavanja turista.';
        }
    });
  }

  dohvatiSveVlasnike(): void {
    this.korisnikService.dohvatiSveVlasnike().subscribe({
        next: (response) => {
            this.sviVlasnici = response;
        },
        error: (err) => {
            console.error('Greska pri dohvatanju svih vlasnika:', err);
            this.porukaVlasnikPretraga = 'Doslo je do greske prilikom ucitavanja vlasnika.';
        }
    });
  }

  aktivirajKorisnika(korisnicko_ime: string): void {
    this.korisnikService.aktivirajKorisnika(korisnicko_ime).subscribe({
      next: (response) => {
        this.dohvatiSveTuriste();
        this.dohvatiSveVlasnike();
      },
      error: (err) => {
        console.error(`Greska pri aktiviranju korisnika ${korisnicko_ime}:`, err);
        this.porukaDetalji = `Doslo je do greske prilikom aktivacije korisnika ${korisnicko_ime}.`;
      }
    });
  }

  odbijKorisnika(korisnicko_ime: string): void {
    this.korisnikService.odbijKorisnika(korisnicko_ime).subscribe({
      next: (response) => {
        this.dohvatiSveTuriste();
        this.dohvatiSveVlasnike();
      },
      error: (err) => {
        console.error(`Greska pri odbijanju korisnika ${korisnicko_ime}:`, err);
        this.porukaDetalji = `Doslo je do greske prilikom odbijanja korisnika ${korisnicko_ime}.`;
      }
    });
  }

  blokirajKorisnika(korisnicko_ime: string): void {
    this.korisnikService.blokirajKorisnika(korisnicko_ime).subscribe({
      next: (response) => {
        this.dohvatiSveTuriste();
        this.dohvatiSveVlasnike();
      },
      error: (err) => {
        console.error(`Greska pri blokiranju korisnika ${korisnicko_ime}:`, err);
        this.porukaDetalji = `Doslo je do greske prilikom blokiranja korisnika ${korisnicko_ime}.`;
      }
    });
  }

  urediKorisnika(korisnicko_ime: string): void {
    this.router.navigate(['/admin_korisnici_uredi', korisnicko_ime]);
  }

}
