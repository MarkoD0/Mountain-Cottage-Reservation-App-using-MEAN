import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Korisnik } from '../../models/korisnik';
import { Vikendica } from '../../models/vikendica';
import { Rezervacija } from '../../models/rezervacija';
import { RezervacijaService } from '../../services/rezervacija.service';

const SEZONE_MAP = {
  1: 'zima', 2: 'zima', 3: 'prolece', 4: 'prolece',
  5: 'prolece', 6: 'leto', 7: 'leto', 8: 'leto',
  9: 'jesen', 10: 'jesen', 11: 'jesen', 12: 'zima'
};

@Component({
  selector: 'app-detalji-vikendice',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './detalji-vikendice.component.html',
  styleUrl: './detalji-vikendice.component.css'
})

export class DetaljiVikendiceComponent {

  private rezervacijaService = inject(RezervacijaService);

  @Input() vikendica: Vikendica | null = null;
  ulogovan: Korisnik = new Korisnik();
  @Output() vratiSe = new EventEmitter<void>();

  private backendUrl = 'http://localhost:4000';

  trenutnaSlikaIndex: number = 0;

  trenutniKorak: number = 1;
  rezervacijaPodaci = {
    datumPocetka: '', // YYYY-MM-DD format za input type="date"
    datumKraja: '',   // YYYY-MM-DD format
    odrasli: 1,       // Minimalno 1
    deca: 0
  };
  porukaGreske: string = '';
  minDatum: string = new Date().toISOString().split('T')[0];

  rezervacijaZaSlanje: Rezervacija | null = null;
  ukupanBrojNocenja: number = 0;
  karticaZaPlacanje: string = ''; 
  dodatniZahtevi: string = '';

  cardType: string = '';
  porukaGreskeKartica: string = '';

  porukaUspeha: string = '';
  poslatiIDRezervacije: number | null = null;

  constructor() {
    this.rezervacijaPodaci.odrasli = 1;
  }

  ngOnInit(): void {
    const korisnikPodaci = localStorage.getItem('ulogovan');
    if (korisnikPodaci) {
        this.ulogovan = JSON.parse(korisnikPodaci);
    }
    this.karticaZaPlacanje = this.ulogovan.kartica;
  }

  getSlikaUrl(slika: string): string {
    return `${this.backendUrl}/slike/${slika}`;
  }

  sledecaSlika(): void {
    if (this.vikendica && this.vikendica.slike && this.trenutnaSlikaIndex < this.vikendica.slike.length - 1) {
      this.trenutnaSlikaIndex++;
    }
  }

  prethodnaSlika(): void {
    if (this.trenutnaSlikaIndex > 0) {
      this.trenutnaSlikaIndex--;
    }
  }

  getStars(ocena: number): number[] {
      const rounded = Math.round(ocena * 2) / 2;
      const stars: number[] = [];
      for (let i = 1; i <= 5; i++) {
          if (rounded >= i) {stars.push(1);} 
          else if (rounded >= i - 0.5) {stars.push(0.5);} 
          else {stars.push(0);}
      }
      return stars;
  }

  getMapaSlikaUrl(): string {
    return `${this.backendUrl}/slike/mapa.png`;
  }

  validirajKorak1(): boolean {
    this.porukaGreske = '';
    const { datumPocetka, datumKraja, odrasli, deca } = this.rezervacijaPodaci;

    if (!datumPocetka || !datumKraja) {
      this.porukaGreske = 'Morate odabrati datume početka i kraja iznajmljivanja.';
      return false;
    }

    const pocetak = new Date(datumPocetka);
    const kraj = new Date(datumKraja);
    const danas = new Date(this.minDatum);

    pocetak.setHours(14, 0, 0, 0);
    kraj.setHours(10, 0, 0, 0);
    danas.setHours(0, 0, 0, 0);

    if (pocetak <= danas) {
        this.porukaGreske = 'Datum početka iznajmljivanja mora biti barem sutrašnjica.';
        return false;
    }
    if (kraj <= pocetak) {
      this.porukaGreske = 'Datum kraja iznajmljivanja mora biti posle datuma početka.';
      return false;
    }
    if (odrasli < 1) {
      this.porukaGreske = 'Mora biti barem jedna odrasla osoba.';
      return false;
    }
    if (deca < 0) {
      this.porukaGreske = 'Broj dece ne može biti negativan.';
      return false;
    }
    return true;
  }

  proracunajCenu(): { brojNocenja: number, ukupnaCena: number, cenaPoNocenju: number } {
    if (!this.vikendica) return { brojNocenja: 0, ukupnaCena: 0, cenaPoNocenju: 0 };
    let vikendicaa = this.vikendica;
    const pocetak = new Date(this.rezervacijaPodaci.datumPocetka);
    const kraj = new Date(this.rezervacijaPodaci.datumKraja);
    
    if (isNaN(pocetak.getTime()) || isNaN(kraj.getTime()) || pocetak >= kraj) {
        return { brojNocenja: 0, ukupnaCena: 0, cenaPoNocenju: 0 };
    }

    const diffTime = Math.abs(kraj.getTime() - pocetak.getTime());
    const brojNocenja = Math.round(diffTime / (1000 * 60 * 60 * 24));
    this.ukupanBrojNocenja = brojNocenja;

    let ukupnaCena = 0;
    let referentnaCenaPoNocenju = 0;
    
    const cenovnik: { [key: string]: number } = {};
    const postojeceCene: number[] = [];
    
    if (this.vikendica.cenovnik_period && this.vikendica.cenovnik_cena) {
      this.vikendica.cenovnik_period.forEach((period, index) => {
          const cena = vikendicaa.cenovnik_cena[index];
          if (cena !== undefined && cena !== null) {
              cenovnik[period.toLowerCase()] = cena;
              postojeceCene.push(cena);
          }
      });
    }

    let prosecnaCena = 0;
    if (postojeceCene.length > 0) {
        const sumaCena = postojeceCene.reduce((sum, current) => sum + current, 0);
        prosecnaCena = Math.round(sumaCena / postojeceCene.length);
    }
    
    let trenutniDatum = new Date(pocetak);
    for (let i = 0; i < brojNocenja; i++) {
        const mesec = trenutniDatum.getMonth() + 1;
        const sezonaKljuč = SEZONE_MAP[mesec as keyof typeof SEZONE_MAP];
        
        let cenaDana = 0;
        
        if (cenovnik[sezonaKljuč]) {
            cenaDana = cenovnik[sezonaKljuč];
        } else {
            cenaDana = prosecnaCena;
        }

        ukupnaCena += cenaDana;

        if (i === 0) {
            referentnaCenaPoNocenju = cenaDana; 
        }

        trenutniDatum.setDate(trenutniDatum.getDate() + 1);
    }
    ukupnaCena = (ukupnaCena * this.rezervacijaPodaci.odrasli) + (ukupnaCena / 2 * this.rezervacijaPodaci.deca);
    if (ukupnaCena === 0 && brojNocenja > 0 && referentnaCenaPoNocenju === 0) {
      ukupnaCena = brojNocenja * prosecnaCena;
      referentnaCenaPoNocenju = prosecnaCena;
    }
    return { brojNocenja, ukupnaCena, cenaPoNocenju: referentnaCenaPoNocenju };
  }

  nastaviNaKorak2(): void {
    if (!this.validirajKorak1() || !this.vikendica || !this.ulogovan) {
      return;
    }
    const { brojNocenja, ukupnaCena } = this.proracunajCenu();
    if (ukupnaCena <= 0) {
        this.porukaGreske = 'Greška pri proračunu cene. Proverite cenovnik ili odabrane datume.';
        return;
    }

    this.rezervacijaZaSlanje = new Rezervacija();
    this.rezervacijaZaSlanje.idVikendice = this.vikendica.idVikendice;
    this.rezervacijaZaSlanje.turista_korisnicko_ime = this.ulogovan.korisnicko_ime;
    this.rezervacijaZaSlanje.vikendica_naziv = this.vikendica.naziv;
    this.rezervacijaZaSlanje.vikendica_mesto = this.vikendica.mesto;
    this.rezervacijaZaSlanje.vlasnik_korisnicko_ime = this.vikendica.vlasnik_korisnicko_ime;
    this.rezervacijaZaSlanje.datum_rezervisanja = new Date().toISOString(); 
    this.rezervacijaZaSlanje.datum_od = this.rezervacijaPodaci.datumPocetka;
    this.rezervacijaZaSlanje.datum_do = this.rezervacijaPodaci.datumKraja;
    this.rezervacijaZaSlanje.komentar = ''; 
    this.rezervacijaZaSlanje.ocena = 0; 
    this.rezervacijaZaSlanje.cena = ukupnaCena;
    this.rezervacijaZaSlanje.broj_ljudi = this.rezervacijaPodaci.odrasli + this.rezervacijaPodaci.deca;
    this.rezervacijaZaSlanje.status = 'ceka';

    this.porukaGreske = '';
    this.trenutniKorak = 2; 
    console.log('Korak 1 uspesno zavrsen. Podaci:', this.rezervacijaPodaci);
    console.log(this.karticaZaPlacanje);
  }

  vratiNaKorak1(): void {
      this.trenutniKorak = 1;
      this.porukaGreske = '';
      this.rezervacijaZaSlanje = null;
  }

  posaljiRezervaciju(): void {
      if (!this.rezervacijaZaSlanje || !this.ulogovan) {
          this.porukaGreske = "Greška: Podaci o rezervaciji nisu kompletni ili korisnik nije ulogovan.";
          return;
      }
      
      if (!this.proveriKarticu()) {
          this.porukaGreske = this.porukaGreskeKartica;
          return;
      } else {
          this.porukaGreske = '';
      }
      
      this.rezervacijaZaSlanje.komentar = this.dodatniZahtevi;
      
      const podaciZaSlanje = {
          ...this.rezervacijaZaSlanje,
          karticaZaPlacanje: this.karticaZaPlacanje
      };
      
      this.rezervacijaService.kreirajRezervaciju(podaciZaSlanje as Rezervacija)
          .subscribe({
              next: (response) => {
                  this.porukaGreske = '';
                  this.porukaUspeha = response.message;
                  this.poslatiIDRezervacije = response.rezervacija.idRezervacije;
                  
                  console.log("Rezervacija uspešno poslata:", response.message);
                  this.trenutniKorak = 3;
              },
              error: (error) => {
                  console.error("Greška pri slanju rezervacije:", error);
                  this.porukaGreske = `${error.error.message || 'Neuspešno kreiranje rezervacije.'}`;
              }
          });
  }

  vratiSeNaListu(): void {
      this.vratiSe.emit();
  }

  public proveriKarticu(): boolean {
    this.cardType = '';
    this.porukaGreskeKartica = '';
    
    const karticaBroj = this.karticaZaPlacanje.replace(/\s/g, '');
    
    if (!karticaBroj) {
      return true; 
    }
    
    let isValid = false;
    
    if (/^(30[0-5]|309|36|3[89])\d{11}$/.test(karticaBroj) && karticaBroj.length === 14) {
      this.cardType = 'Diners';
      isValid = true;
    }
    if (/^(5[1-5])\d{14}$/.test(karticaBroj) && karticaBroj.length === 16) {
      this.cardType = 'MasterCard';
      isValid = true;
    }
    if (/^4\d{15}$/.test(karticaBroj) && karticaBroj.length === 16) {
      this.cardType = 'Visa';
      isValid = true;
    }
    const visaPrefixes = /^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/;
    if (visaPrefixes.test(karticaBroj) && karticaBroj.length === 16) {
        this.cardType = 'Visa';
        isValid = true;
    }

    if (!isValid) {
        this.porukaGreskeKartica = `Neispravan format kartice. Očekivani tipovi: Diners (14 cifara), MasterCard/Visa (16 cifara).`;
    }
    
    return isValid;
  }

}
