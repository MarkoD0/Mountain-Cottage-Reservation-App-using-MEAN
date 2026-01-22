import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VikendicaService } from '../../services/vikendica.service';
import { Vikendica } from '../../models/vikendica';
import { Korisnik } from '../../models/korisnik'
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin_vikendice',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, DatePipe, NgIf, NgFor],
  templateUrl: './admin_vikendice.component.html',
  styleUrl: './admin_vikendice.component.css'
})
export class AdminVikendiceComponent implements OnInit {

  private vikendicaService = inject(VikendicaService)
  sveVikendice: Vikendica[] = [];
  ulogovan: Korisnik | null = null;
  porukaGreske: string = '';

  ngOnInit(): void {
    let korisnikData = localStorage.getItem('ulogovan');
    if (korisnikData) {
      try {
        this.ulogovan = JSON.parse(korisnikData);
        this.dohvatiSveVikendiceIBlokirane();
      } catch (e) {
        console.error('Greska pri parsiranju ulogovanog korisnika iz localStorage-a', e);
        this.ulogovan = null;
      }
    }
  }

  dohvatiSveVikendiceIBlokirane(): void {
    this.vikendicaService.dohvatiSveVikendiceIBlokirane().subscribe({
      next: (vikendice) => {
        this.sveVikendice = vikendice;
        this.porukaGreske = '';
      },
      error: (err) => {
        console.error('Greska pri dohvatanju vikendica:', err);
        this.porukaGreske = 'Doslo je do greske prilikom ucitavanja vikendica.';
      }
    });
  }

  blokirajVikendicu(idVikendice: number): void {
    this.vikendicaService.blokirajVikendicu(idVikendice).subscribe({
      next: () => {
        this.dohvatiSveVikendiceIBlokirane();
      },
      error: (err) => {
        console.error('Greska pri blokiranju vikendice:', err);
        this.porukaGreske = 'Doslo je do greske prilikom blokiranja vikendice.';
      }
    });
  }

  shouldBeBlocked(vikendica: Vikendica): boolean {
  if (!vikendica.ocene_niz || vikendica.ocene_niz.length < 3) {
    return false;
  }
  const lastThreeRatings = vikendica.ocene_niz.slice(-3);
  const allLessThanTwo = lastThreeRatings.every(rating => rating < 2);
  return allLessThanTwo;
  }

}
