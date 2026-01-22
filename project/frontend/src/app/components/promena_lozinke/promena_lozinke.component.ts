import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { Korisnik } from '../../models/korisnik';
import {FormsModule} from '@angular/forms';
import { LogoutComponent } from '../logout/logout.component';

@Component({
  selector: 'app-promena_lozinke',
  standalone: true,
  imports: [FormsModule, RouterLink, LogoutComponent],
  templateUrl: './promena_lozinke.component.html',
  styleUrl: './promena_lozinke.component.css'
})
export class Promena_lozinkeComponent {

  private userService = inject(UserService)
  private router = inject(Router)

  ulogovan: Korisnik = new Korisnik();

  lozinka_stara: string = "";
  lozinka_nova: string = "";
  lozinka_nova2: string = "";

  poruka: string = "";

  ngOnInit(): void {
    let korisnik = localStorage.getItem('ulogovan');
    if (korisnik != null) this.ulogovan = JSON.parse(korisnik);
  }

  get backLink(): string {
    if (this.ulogovan.tip === 'turista') {
      return '/turista';
    } else if (this.ulogovan.tip === 'vlasnik') {
      return '/vlasnik';
    } else if (this.ulogovan.tip === 'admin') {
      return '/admin';
    }
    return '/';
  }

  private lozinkaRegex = /^(?=.*[A-Z])(?=(.*[a-z]){3})(?=.*\d)(?=.*[!@#$%^&*()\-+])(?=.*[a-zA-Z])[a-zA-Z].{5,9}$/;

  public proveriLozinku(): boolean {
    if (this.lozinka_nova === this.lozinka_stara) {
      this.poruka = 'Nova lozinka i stara lozinka ne smeju biti iste.';
      return false;
    }
    if (this.lozinka_nova !== this.lozinka_nova2) {
      this.poruka = 'Nova lozinka i ponovljena lozinka se ne podudaraju.';
      return false;
    }
    if (!this.lozinkaRegex.test(this.lozinka_nova)) {
      this.poruka = 'Lozinka mora imati između 6 i 10 karaktera, počinjati slovom, sadržati bar jedno veliko slovo, tri mala slova, jedan broj i jedan specijalni karakter.';
      return false;
    }
    return true;
  }

  promeniLozinku() {
    this.poruka = '';

    if (!this.lozinka_stara || !this.lozinka_nova || !this.lozinka_nova2) {
      this.poruka = 'Molimo popunite sva polja.';
      return;
    }
    if (!this.proveriLozinku()) {
      return;
    }

    this.userService.promenaLozinke(this.ulogovan.korisnicko_ime, this.lozinka_stara, this.lozinka_nova).subscribe({
      next: (response: any) => {
        alert('Lozinka je uspešno promenjena!');
        localStorage.clear();
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Greška pri promeni lozinke:', err);
        this.poruka = err.error.message || 'Stara lozinka nije ispravna ili je došlo do greške na serveru.';
      }
    });
  }

}
