import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Korisnik } from '../../models/korisnik';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  korisnik: Korisnik = new Korisnik();

  // Form fields
  korisnicko_ime: string = '';
  lozinka: string = '';
  tip: string = 'turista';
  ime: string = '';
  prezime: string = '';
  pol: string = '';
  adresa: string = '';
  telefon: string = '';
  mejl: string = '';
  kartica: string = '';
  profilnaSlika: File | null = null;

  cardType: string = '';
  poruka: string = '';

  //минимално 6 карактера, максимално 10 карактера, од тога бар једно велико слово, три мала слова, један број и један специјални карактер, и мора почињати словом
  private lozinkaRegex = /^(?=.*[A-Z])(?=(.*[a-z]){3})(?=.*\d)(?=.*[!@#$%^&*()\-+])(?=.*[a-zA-Z])[a-zA-Z].{5,9}$/;

  public proveriLozinku(): boolean {
    if (!this.lozinkaRegex.test(this.lozinka)) {
      this.poruka = 'Lozinka mora imati između 6 i 10 karaktera, počinjati slovom, sadržati bar jedno veliko slovo, tri mala slova, jedan broj i jedan specijalni karakter.';
      return false;
    }
    return true;
  }

  public proveriKarticu(): boolean {
    this.cardType = ''; // Reset
    const karticaBroj = this.kartica.replace(/\s/g, ''); // Ukloni razmake, ako postoje
    if (!karticaBroj) return true; // Nije obavezno polje
    // Diners
    if (/^(30[0-3]|36|38)\d{12}$/.test(karticaBroj) && karticaBroj.length === 15) {
      this.cardType = 'Diners';
      return true;
    }
    // MasterCard
    if (/^(5[1-5])\d{14}$/.test(karticaBroj) && karticaBroj.length === 16) {
      this.cardType = 'MasterCard';
      return true;
    }
    // Visa
    const visaPrefixes = /^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/;
    if (visaPrefixes.test(karticaBroj) && karticaBroj.length === 16) {
      this.cardType = 'Visa';
      return true;
    }
    return false;
  }

  private mejlRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  public proveriMejl(): boolean {
    if (!this.mejlRegex.test(this.mejl)) {
      this.poruka = 'E-mail adresa nije u ispravnom formatu (npr. ime@domen.rs).';
      return false;
    }
    return true;
  }

  onFileSelected(event: any): void {
    this.poruka = '';
    const file: File = event.target.files[0];

    if (!file) return;
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.poruka = 'Greška: Dozvoljeni su samo JPG i PNG formati.';
        this.profilnaSlika = null;
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
            this.profilnaSlika = file;
          } else {
            this.poruka = 'Greška: Slika mora biti između 100x100 i 300x300 piksela.';
            this.profilnaSlika = null;
            event.target.value = null;
          }
        };
      };
    }
  }

  registracija() {
    this.poruka = '';

    if (!this.korisnicko_ime || !this.lozinka || !this.ime || !this.prezime || !this.mejl) {
      this.poruka = 'Molimo popunite sva obavezna polja.';
      return;
    }
    if (!this.proveriLozinku()) {
      return;
    }
    if (this.kartica && !this.proveriKarticu()) {
      this.poruka = 'Broj kreditne kartice nije validan za nijedan od podržanih tipova (Diners, MasterCard, Visa).';
      return;
    }
    if (!this.proveriMejl()) {
      return;
    }

    const formData = new FormData();
    formData.append('korisnicko_ime', this.korisnicko_ime);
    formData.append('lozinka', this.lozinka);
    formData.append('tip', this.tip);
    formData.append('ime', this.ime);
    formData.append('prezime', this.prezime);
    formData.append('pol', this.pol);
    formData.append('adresa', this.adresa);
    formData.append('telefon', this.telefon);
    formData.append('mejl', this.mejl);
    formData.append('kartica', this.kartica);
    formData.append('status', 'ceka');
    if (this.profilnaSlika) {
      formData.append('profilnaSlika', this.profilnaSlika, this.profilnaSlika.name);
    }

    this.userService.register(formData).subscribe({
      next: (response: any) => {
        alert('Zahtev za registraciju je uspešno poslat. Molimo sačekajte odobrenje administratora.');
        this.router.navigate(['']);
        this.poruka = '';
      },
      error: (err) => {
        console.error("Registration Error:", err);
        this.poruka = err.error.message || 'Došlo je do greške prilikom registracije.';
      }
    });
  }
}
