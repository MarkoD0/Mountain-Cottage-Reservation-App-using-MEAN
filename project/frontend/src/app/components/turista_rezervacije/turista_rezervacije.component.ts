import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { Korisnik } from '../../models/korisnik';
import { Rezervacija } from '../../models/rezervacija';
import { RezervacijaService } from '../../services/rezervacija.service';

@Component({
  selector: 'app-turista_rezervacije',
  standalone: true,
  imports: [CommonModule, DatePipe, NgIf, NgFor],
  templateUrl: './turista_rezervacije.component.html',
  styleUrl: './turista_rezervacije.component.css'
})
export class TuristaRezervacijeComponent implements OnInit {

  private rezervacijaService = inject(RezervacijaService);
  
  ulogovan: Korisnik | null = null;
  rezervacije: Rezervacija[] = [];
  porukaGreske: string = '';
  ucitavanje: boolean = true;
  
  // Mape za lakši prikaz statusa
  statusMap: { [key: string]: string } = {
    'ceka': 'Na čekanju 🕒',
    'odobrena': 'Odobrena ✅',
    'odbijena': 'Odbijena ❌'
  };

  statusClassMap: { [key: string]: string } = {
    'ceka': 'status-ceka',
    'odobrena': 'status-odobrena',
    'odbijena': 'status-odbijena'
  };


  ngOnInit(): void {
    const korisnikPodaci = localStorage.getItem('ulogovan');
    if (korisnikPodaci) {
      this.ulogovan = JSON.parse(korisnikPodaci);
        this.dohvatiRezervacije();
    } else {
        this.porukaGreske = 'Korisnik nije ulogovan. Molimo prijavite se da biste videli rezervacije.';
        this.ucitavanje = false;
    }
  }

  dohvatiRezervacije(): void {
    if (!this.ulogovan) return;

    this.ucitavanje = true;
    this.porukaGreske = '';
    
    this.rezervacijaService.dohvatiRezervacijeTuriste(this.ulogovan.korisnicko_ime)
      .subscribe({
        next: (data) => {
          this.rezervacije = data;
          this.ucitavanje = false;
        },
        error: (err) => {
          console.error('Greška pri dohvatanju rezervacija:', err);
          this.porukaGreske = 'Došlo je do greške prilikom dohvatanja vaših rezervacija sa servera.';
          this.ucitavanje = false;
        }
      });
  }

}
