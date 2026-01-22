import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Korisnik } from '../../models/korisnik';

@Component({
  selector: 'app-admin_korisnici_uredi',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, NgIf, NgFor],
  templateUrl: './admin_korisnici_uredi.component.html',
  styleUrl: './admin_korisnici_uredi.component.css'
})
export class AdminKorisniciUrediComponent implements OnInit {

  private userService = inject(UserService)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private backendUrl = 'http://localhost:4000';

  korisnikZaIzmenu: Korisnik = new Korisnik();
  originalniKorisnik: Korisnik = new Korisnik();
  korisnicko_ime: string = '';

  cardType: string = '';

  modAzuriranja: boolean = true;
  novaSlika: File | null = null;
  poruka: string = '';
  porukaUspeh = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.korisnicko_ime = params['korisnicko_ime'];
      if (this.korisnicko_ime) {
        this.dohvatiKorisnikaZaIzmenu(this.korisnicko_ime);
      } else {
        this.poruka = 'Greška: Nije prosleđeno korisničko ime za izmenu.';
      }
    });
  }

  dohvatiKorisnikaZaIzmenu(korisnicko_ime: string): void {
    this.userService.dohvatiKorisnika(korisnicko_ime).subscribe({
      next: (korisnik) => {
        if (korisnik) {
          this.korisnikZaIzmenu = korisnik;
          this.originalniKorisnik = JSON.parse(JSON.stringify(korisnik)); // Deep copy
          this.proveriKarticu();
        } else {
          this.poruka = 'Greška: Korisnik nije pronađen.';
        }
      },
      error: (err) => {
        console.error(err);
        this.poruka = 'Greška prilikom dohvatanja podataka korisnika.';
      }
    });
  }

  proveriKarticu(): void {
    this.cardType = '';
    const karticaBroj = this.korisnikZaIzmenu.kartica ? this.korisnikZaIzmenu.kartica.replace(/\s/g, '') : '';
    if (!karticaBroj) { this.cardType = ''; return; }

    if (/^(30[0-3]|36|38)\d{12}$/.test(karticaBroj) && karticaBroj.length === 15) {this.cardType = 'Diners';}
    else if (/^(5[1-5])\d{14}$/.test(karticaBroj) && karticaBroj.length === 16) {this.cardType = 'MasterCard';}
    else if (/^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/.test(karticaBroj) && karticaBroj.length === 16) {this.cardType = 'Visa';}
    else {this.cardType = 'Nepoznat tip';}
  }

  getImageUrl(slika: string): string {
    if (!slika) {
      return `${this.backendUrl}/slike/default.png`;
    }
    return `${this.backendUrl}/slike/${slika}`;
  }

  odustani(): void {
    this.router.navigate(['/admin']); 
  }

  onFileSelected(event: any): void {
      this.poruka = '';
      this.porukaUspeh = '';
      const file: File = event.target.files[0];

      if (!file) return;
      if (file) {
          if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
              this.poruka = 'Greska: Dozvoljeni su samo JPG i PNG formati.';
              this.novaSlika = null;
              event.target.value = null;
              return;
          }

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
              const img = new Image();
              img.src = reader.result as string;
              img.onload = () => {
                  const height = img.naturalHeight;
                  const width = img.naturalWidth;

                  if (width >= 100 && width <= 300 && height >= 100 && height <= 300) {
                      this.novaSlika = file;
                  } else {
                      this.poruka = 'Greska: Slika mora biti izmedu 100x100 i 300x300 piksela.';
                      this.novaSlika = null;
                      event.target.value = null;
                  }
              };
          };
      }
  }

  private mejlRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  azurirajProfil(): void {
    this.poruka = '';
    this.porukaUspeh = '';

    if (!this.korisnikZaIzmenu.ime || !this.korisnikZaIzmenu.prezime || !this.korisnikZaIzmenu.mejl) {
      this.poruka = 'Molimo popunite sva obavezna polja (Ime, Prezime, Mejl).';
      return;
    }
    if (!this.mejlRegex.test(this.korisnikZaIzmenu.mejl)) {
      this.poruka = 'E-mail adresa nije u ispravnom formatu.';
      return;
    }

    this.proveriKarticu();
    if (this.korisnikZaIzmenu.kartica && this.cardType === 'Nepoznat tip') {
      this.poruka = 'Broj kreditne kartice nije validan.';
      return;
    }

    const formData = new FormData();
    formData.append('korisnicko_ime', this.originalniKorisnik.korisnicko_ime);
    formData.append('tip', this.originalniKorisnik.tip);
    formData.append('ime', this.korisnikZaIzmenu.ime);
    formData.append('prezime', this.korisnikZaIzmenu.prezime);
    formData.append('pol', this.korisnikZaIzmenu.pol || '');
    formData.append('adresa', this.korisnikZaIzmenu.adresa || '');
    formData.append('telefon', this.korisnikZaIzmenu.telefon || '');
    formData.append('mejl', this.korisnikZaIzmenu.mejl);
    formData.append('kartica', this.korisnikZaIzmenu.kartica || '');

    if (this.novaSlika) {
      formData.append('profilnaSlika', this.novaSlika, this.novaSlika.name);
    }

    this.userService.azurirajKorisnika(formData).subscribe({
      next: (response: any) => {
        const azuriraniKorisnik = response.korisnik;
        this.korisnikZaIzmenu = azuriraniKorisnik;
        this.originalniKorisnik = JSON.parse(JSON.stringify(azuriraniKorisnik));
        this.proveriKarticu();

        this.porukaUspeh = 'Podaci uspesno azurirani!';
        this.novaSlika = null;
        this.router.navigate(['/admin']); 
      },
      error: (err: any) => {
        console.error(err);
        this.poruka = err.error.message || 'Greska prilikom azuriranja. Proverite unete podatke.';
      }
    });
  }

}