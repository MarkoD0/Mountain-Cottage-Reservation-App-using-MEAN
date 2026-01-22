import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { VikendicaService } from '../../services/vikendica.service';
import { RezervacijaService } from '../../services/rezervacija.service';
import { Router, RouterLink } from '@angular/router';
import { Korisnik } from '../../models/korisnik';
import { Vikendica } from '../../models/vikendica';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private userService = inject(UserService)
  private vikendicaService = inject(VikendicaService)
  private rezervacijaService = inject(RezervacijaService)
  private router = inject(Router)

  korisnicko_ime: string = "";
  lozinka: string = "";
  tip: string = "";
  poruka: string = "";

  ukupnoVikendica: number = 0;
  brojVlasnika: number = 0;
  brojTurista: number = 0;
  sveVikendice: Vikendica[] = [];

  porukaVikendicaPretraga: string = "";
  nazivVikendicaPretraga: string = "";
  mestoVikendicaPretraga: string = "";

  brojRezervisanih24h: number = 0;
  brojRezervisanih7d: number = 0;
  brojRezervisanih30d: number = 0;
  
  sortKolona: string = '';
  sortSmer: number = 1;   // 1 za uzlazno, -1 za silazno

  ngOnInit(): void {
    this.vikendicaService.dohvatiBrojAktivnihVikendica().subscribe({
      next: (response) => {
        this.ukupnoVikendica = response.count;
      },
      error: (err) => {
        console.error('Greška pri dohvatanju broja vikendica:', err);
        this.ukupnoVikendica = 0;
      }
    });
    this.userService.dohvatiBrojKorisnika().subscribe({
      next: (response) => {
        this.brojVlasnika = response.brojVlasnika;
        this.brojTurista = response.brojTurista;
      },
      error: (err) => {
        console.error('Greška pri dohvatanju broja korisnika:', err);
      }
    });
    this.rezervacijaService.dohvatiBrojRezervacija().subscribe({
      next: (response) => {
        this.brojRezervisanih24h = response.brojRezervisanih24h;
        this.brojRezervisanih7d = response.brojRezervisanih7d;
        this.brojRezervisanih30d = response.brojRezervisanih30d;
      },
      error: (err) => {
        console.error('Greška pri dohvatanju broja rezervacija:', err);
      }
    });
    this.vikendicaService.dohvatiSveVikendice().subscribe({
      next: (response) => {
        this.sveVikendice = response;
      },
      error: (err) => {
        console.error('Greška pri dohvatanju svih vikendica:', err);
      }
    });
  }

  prijavaNaSistem() {
    this.userService.prijavaNaSistem(this.korisnicko_ime, this.lozinka).subscribe({
      next: (korisnik) => {
        if (!korisnik) {
          this.poruka = 'Neispravni podaci ili korisnik ne postoji';
        } else {
          if (korisnik.tip == this.tip) {
            this.poruka = '';
              localStorage.setItem('ulogovan', JSON.stringify(korisnik));
              if (korisnik.tip == "turista") {
              this.router.navigate(['turista']);
              } else {
                this.router.navigate(['vlasnik']);
              }
          } else {
            this.poruka = 'Pogresan tip korisnika';
          }
        }
      },
      error: (err) => {
        this.poruka = 'Neispravni podaci ili korisnik ne postoji';
        console.error('Login error:', err);
      }
    });
  }

  pretraziVikendice(){
    this.porukaVikendicaPretraga = '';
    if(!this.nazivVikendicaPretraga && !this.mestoVikendicaPretraga){
      this.porukaVikendicaPretraga = 'Barem jedno polje za pretragu mora biti popunjeno za primenu filetera, sve vikendice ako nema parametara';
      this.vikendicaService.dohvatiSveVikendice().subscribe({
          next: (response) => {
            this.sveVikendice = response;
          },
          error: (err) => {
            console.error('Greška pri dohvatanju svih vikendica:', err);
          }
      });
      return;
    }
    this.vikendicaService.dohvatiVikendice(this.nazivVikendicaPretraga, this.mestoVikendicaPretraga).subscribe({
        next: (response) => {
            this.sveVikendice = response;
            if (this.sveVikendice.length === 0) {
                this.porukaVikendicaPretraga = 'Nema rezultata pretrage.';
            }
        },
        error: (err) => {
            this.porukaVikendicaPretraga = 'Došlo je do greške prilikom pretrage.';
            console.error('Greška pri pretrazi vikendica:', err);
        }
    });
  }

  sortirajVikendice(kolona: string): void {
      // Ako se klilne na istu kolonu, promeni smer
      if (this.sortKolona === kolona) {
          this.sortSmer = this.sortSmer * -1;
      } else {
          // Ako se klilne na novu kolonu, postavi je kao novu kolonu za sortiranje i smer na uzlazni
          this.sortKolona = kolona;
          this.sortSmer = 1;
      }
      this.primeniSortiranje();
  }

  primeniSortiranje(): void {
      if (!this.sortKolona) return;
      
      this.sveVikendice.sort((a, b) => {
          let aValue: any;
          let bValue: any;
          if (this.sortKolona === 'naziv') {
              aValue = a.naziv.toLowerCase();
              bValue = b.naziv.toLowerCase();
          } else if (this.sortKolona === 'mesto') {
              aValue = a.mesto.toLowerCase();
              bValue = b.mesto.toLowerCase();
          } else {
              return 0;
          }

          if (aValue < bValue) {
              return -1 * this.sortSmer;
          }
          if (aValue > bValue) {
              return 1 * this.sortSmer;
          }
          return 0;
      });
  }

}
