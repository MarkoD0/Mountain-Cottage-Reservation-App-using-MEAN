import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Korisnik } from '../../models/korisnik';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-admin_login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin_login.component.html',
  styleUrl: './admin_login.component.css'
})
export class Admin_loginComponent {

  private userService = inject(UserService)
  private router = inject(Router)

  korisnicko_ime: string = "";
  lozinka: string = "";
  poruka: string = "";

  prijavaNaSistem() {
    this.userService.prijavaNaSistem(this.korisnicko_ime, this.lozinka).subscribe((korisnik) => {
      if (!korisnik) {
        this.poruka = 'Neispravni podaci ili korisnik ne postoji';
      }
      else {
        if (korisnik.tip == "admin") {
          this.poruka = '';
          localStorage.setItem('ulogovan', JSON.stringify(korisnik));
          this.router.navigate(['admin']);
        }
        else {
          this.poruka = 'Korisnik nije administrator';
        }
      }
    })
  }

}
