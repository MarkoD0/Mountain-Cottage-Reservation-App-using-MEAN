import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Korisnik } from '../../models/korisnik';
import { LogoutComponent } from '../logout/logout.component';


@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, LogoutComponent],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit {

  private userService = inject(UserService)
  private backendUrl = 'http://localhost:4000';

  ulogovan: Korisnik = new Korisnik();
  originalniKorisnik: Korisnik = new Korisnik();

  cardType: string = '';

  modAzuriranja: boolean = false;
  novaSlika: File | null = null;
  poruka: string = '';
  porukaUspeh = '';

  ngOnInit(): void {
    let korisnik = localStorage.getItem('ulogovan');
    if (korisnik != null) {
      this.ulogovan = JSON.parse(korisnik);
      this.originalniKorisnik = JSON.parse(korisnik);
    }
  this.proveriKarticu();
  }

  proveriKarticu(): void {
    this.cardType = '';
    const karticaBroj = this.ulogovan.kartica ? this.ulogovan.kartica.replace(/\s/g, '') : '';
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

  omoguciAzuriranje(): void {
      this.modAzuriranja = true;
      this.poruka = '';
      this.porukaUspeh = '';
      let korisnik = localStorage.getItem('ulogovan');
      if (korisnik != null) this.originalniKorisnik = JSON.parse(korisnik);
  }

    odustani(): void {
      this.ulogovan = JSON.parse(JSON.stringify(this.originalniKorisnik)); 
      this.modAzuriranja = false;
      this.novaSlika = null;
      this.poruka = '';
      this.porukaUspeh = '';
      this.proveriKarticu();
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
    
    if (!this.ulogovan.ime || !this.ulogovan.prezime || !this.ulogovan.mejl) {
        this.poruka = 'Molimo popunite sva obavezna polja (Ime, Prezime, Mejl).';
        return;
    }
    if (!this.mejlRegex.test(this.ulogovan.mejl)) {
        this.poruka = 'E-mail adresa nije u ispravnom formatu.';
        return;
    }
    
    this.proveriKarticu();
    if (this.ulogovan.kartica && this.cardType === 'Nepoznat tip') {
        this.poruka = 'Broj kreditne kartice nije validan.';
        return;
    }

    const formData = new FormData();
    formData.append('korisnicko_ime', this.ulogovan.korisnicko_ime);
    formData.append('tip', this.ulogovan.tip);
    formData.append('ime', this.ulogovan.ime);
    formData.append('prezime', this.ulogovan.prezime);
    formData.append('pol', this.ulogovan.pol || '');
    formData.append('adresa', this.ulogovan.adresa || '');
    formData.append('telefon', this.ulogovan.telefon || '');
    formData.append('mejl', this.ulogovan.mejl);
    formData.append('kartica', this.ulogovan.kartica || '');
    
    if (this.novaSlika) {
        formData.append('profilnaSlika', this.novaSlika, this.novaSlika.name);
    }

    this.userService.azurirajKorisnika(formData).subscribe({
        next: (response: any) => {
            const azuriraniKorisnik = response.korisnik;
            localStorage.setItem('ulogovan', JSON.stringify(azuriraniKorisnik));
            this.ulogovan = azuriraniKorisnik;
            this.originalniKorisnik = JSON.parse(JSON.stringify(azuriraniKorisnik));
            this.proveriKarticu();
            
            this.porukaUspeh = 'Podaci uspesno azurirani!';
            this.modAzuriranja = false;
            this.novaSlika = null;
        },
        error: (err: any) => {
            console.error(err);
            this.poruka = err.error.message || 'Greska prilikom azuriranja. Proverite unete podatke.';
        }
    });
  }

}
