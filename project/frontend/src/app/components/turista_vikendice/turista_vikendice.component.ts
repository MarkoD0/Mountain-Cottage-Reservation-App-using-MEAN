import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VikendicaService } from '../../services/vikendica.service';
import { Vikendica } from '../../models/vikendica';
import { Korisnik } from '../../models/korisnik'
import { DetaljiVikendiceComponent } from '../detalji-vikendice/detalji-vikendice.component';

@Component({
  selector: 'app-turista_vikendice',
  standalone: true,
  imports: [FormsModule, CommonModule, DetaljiVikendiceComponent],
  templateUrl: './turista_vikendice.component.html',
  styleUrl: './turista_vikendice.component.css'
})
export class TuristaVikendiceComponent implements OnInit {

  private vikendicaService = inject(VikendicaService)

  sveVikendice: Vikendica[] = [];

  porukaVikendicaPretraga: string = "";
  nazivVikendicaPretraga: string = "";
  mestoVikendicaPretraga: string = "";
  
  sortKolona: string = '';
  sortSmer: number = 1;   // 1 za uzlazno, -1 za silazno

  prikaziDetalje: boolean = false;
  selektovanaVikendica: Vikendica | null = null;
  ulogovan: Korisnik | null = null;
  porukaDetalji: string = '';

  ngOnInit(): void {
    this.dohvatiSveVikendice();

    let korisnikData = localStorage.getItem('ulogovan');
    if (korisnikData) {
      try {
        this.ulogovan = JSON.parse(korisnikData);
      } catch (e) {
        console.error('Greška pri parsiranju ulogovanog korisnika iz localStorage-a', e);
        this.ulogovan = null;
      }
    }
  }

  dohvatiSveVikendice(): void {
    this.vikendicaService.dohvatiSveVikendice().subscribe({
        next: (response) => {
            this.sveVikendice = response;
        },
        error: (err) => {
            console.error('Greska pri dohvatanju svih vikendica:', err);
            this.porukaVikendicaPretraga = 'Doslo je do greske prilikom ucitavanja vikendica.';
        }
    });
  }

  pretraziVikendice(): void {
    this.porukaVikendicaPretraga = '';

    if(!this.nazivVikendicaPretraga && !this.mestoVikendicaPretraga){
        this.porukaVikendicaPretraga = 'Prikazane su sve vikendice jer parametri za pretragu nisu uneti.';
        this.dohvatiSveVikendice();
        return;
    }

    this.vikendicaService.dohvatiVikendice(this.nazivVikendicaPretraga, this.mestoVikendicaPretraga).subscribe({
        next: (response) => {
            this.sveVikendice = response;
            if (this.sveVikendice.length === 0) {
                this.porukaVikendicaPretraga = 'Nema rezultata pretrage koji odgovaraju kriterijumima.';
            }
        },
        error: (err) => {
            this.porukaVikendicaPretraga = 'Doslo je do greske prilikom pretrage.';
            console.error('Greska pri pretrazi vikendica:', err);
        }
    });
  }
  
  getStars(ocena: number): number[] {
      const rounded = Math.round(ocena * 2) / 2;
      
      const stars: number[] = [];
      for (let i = 1; i <= 5; i++) {
          if (rounded >= i) {
              stars.push(1);
          } else if (rounded >= i - 0.5) {
              stars.push(0.5); // Pola zvezde
          } else {
              stars.push(0); // Prazna zvezda
          }
      }
      return stars;
  }

  sortirajVikendice(kolona: string): void {
      if (this.sortKolona === kolona) {
          this.sortSmer = this.sortSmer * -1;
      } else {
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

  prikaziDetaljeVikendice(idVikendice: number): void {
      this.porukaDetalji = '';
      this.selektovanaVikendica = null;
      
      this.vikendicaService.dohvatiDetaljeVikendice(idVikendice).subscribe({
          next: (data: Vikendica) => {
              this.selektovanaVikendica = data;
              this.prikaziDetalje = true;
          },
          error: (err) => {
              this.porukaDetalji = 'Greska pri dohvatanju detalja vikendice.';
              console.error(err);
          }
      });
  }

  vratiSeNaTabelu(): void {
      this.prikaziDetalje = false;
      this.selektovanaVikendica = null;
      this.porukaDetalji = '';
  }

}
