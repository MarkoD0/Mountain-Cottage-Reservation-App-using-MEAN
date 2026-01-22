import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { Korisnik } from '../../models/korisnik';
import { Rezervacija } from '../../models/rezervacija';
import { RezervacijaService } from '../../services/rezervacija.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vlasnik_rezervacije',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, DatePipe, NgIf, NgFor],
  templateUrl: './vlasnik_rezervacije.component.html',
  styleUrl: './vlasnik_rezervacije.component.css'
})
export class VlasnikRezervacijeComponent implements OnInit {

  private rezervacijaService = inject(RezervacijaService);
  
  ulogovan: Korisnik | null = null;
  neobradjeneRezervacije: Rezervacija[] = [];

  porukaGreske: string = '';

  prikaziModalOdbijanja: boolean = false;
  rezervacijaZaObraduID: number | null = null;
  komentarOdbijanja: string = '';
  porukaModala: string = '';

  ngOnInit(): void {
    const korisnikPodaci = localStorage.getItem('ulogovan');
    if (korisnikPodaci) {
      this.ulogovan = JSON.parse(korisnikPodaci);
      this.dohvatiNeobradjeneRezervacije();
    } else {
      this.porukaGreske = 'Korisnik nije ulogovan. Molimo prijavite se da biste videli rezervacije.';
    }
  }

  dohvatiNeobradjeneRezervacije(): void {
    if (this.ulogovan?.korisnicko_ime) {
      this.rezervacijaService.dohvatiNeobradjeneRezervacijeVlasnika(this.ulogovan.korisnicko_ime).subscribe({
        next: (rezervacije) => {
          this.neobradjeneRezervacije = rezervacije;
          this.porukaGreske = '';
        },
        error: (err) => {
          console.error('Greška pri dohvatanju rezervacija:', err);
          this.porukaGreske = 'Došlo je do greške prilikom učitavanja neobrađenih rezervacija.';
        }
      });
    }
  }

  potvrdiRezervaciju(idRezervacije: number): void {
    if (confirm('Da li ste sigurni da želite da POTVRDITE ovu rezervaciju?')) {
        this.rezervacijaService.obradiRezervaciju(idRezervacije, 'odobrena').subscribe({
            next: (res) => {
                alert(res.message);
                this.dohvatiNeobradjeneRezervacije();
            },
            error: (err) => {
                alert(`Greška: ${err.error.message || 'Neuspešna potvrda rezervacije.'}`);
            }
        });
    }
  }

  odbijRezervaciju(): void {
    if (!this.rezervacijaZaObraduID) return;

    if (this.komentarOdbijanja.trim().length < 5) {
      this.porukaModala = 'Komentar mora imati najmanje 5 karaktera.';
      return;
    }
    
    this.rezervacijaService.obradiRezervaciju(this.rezervacijaZaObraduID, 'odbijena', this.komentarOdbijanja).subscribe({
        next: (res) => {
            alert(res.message);
            this.zatvoriModalOdbijanja();
            this.dohvatiNeobradjeneRezervacije();
        },
        error: (err) => {
            this.porukaModala = err.error.message || 'Neuspešno odbijanje rezervacije.';
        }
    });
  }

  otvoriModalOdbijanja(idRezervacije: number): void {
    this.rezervacijaZaObraduID = idRezervacije;
    this.komentarOdbijanja = '';
    this.porukaModala = '';
    this.prikaziModalOdbijanja = true;
  }

  zatvoriModalOdbijanja(): void {
    this.prikaziModalOdbijanja = false;
    this.rezervacijaZaObraduID = null;
    this.komentarOdbijanja = '';
    this.porukaModala = '';
  }

}
