import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Korisnik } from '../models/korisnik';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  uri = 'http://localhost:4000/korisnici';

  constructor() { }

  private http = inject(HttpClient)

  prijavaNaSistem(korisnicko_ime: string, lozinka: string) {
    const data = {
      korisnicko_ime: korisnicko_ime,
      lozinka: lozinka,
    };
    return this.http.post<Korisnik>(`${this.uri}/login`, data);
  }

  register(formData: FormData) {
    return this.http.post(`${this.uri}/register`, formData);
  }

  dohvatiKorisnika(korisnicko_ime: string) {
    return this.http.get<Korisnik>(`${this.uri}/getUser/${korisnicko_ime}`);
  }

  promenaLozinke(korisnicko_ime: string, lozinka_stara: string, lozinka_nova: string){
    const data = {
      korisnicko_ime: korisnicko_ime,
      lozinka_stara: lozinka_stara,
      lozinka_nova: lozinka_nova,
    };
    return this.http.post(`${this.uri}/promena_lozinke`, data);
  }

  dohvatiBrojKorisnika() {
    return this.http.get<{ brojVlasnika: number; brojTurista: number }>(`${this.uri}/broj_korisnika_po_tipu`);
  }

  azurirajKorisnika(formData: FormData) {
    return this.http.post<{ korisnik: Korisnik, message: string }>(`${this.uri}/azuriraj_profil`, formData);
  }
    
  dohvatiSveTuriste() {
    return this.http.get<Korisnik[]>(`${this.uri}/sve_turiste`);
  }
    
  dohvatiSveVlasnike() {
    return this.http.get<Korisnik[]>(`${this.uri}/sve_vlasnike`);
  }

  aktivirajKorisnika(korisnicko_ime: string) {
    return this.http.post<{ message: string }>(`${this.uri}/aktiviraj_korisnika`, { korisnicko_ime });
  }

  blokirajKorisnika(korisnicko_ime: string) {
    return this.http.post<{ message: string }>(`${this.uri}/blokiraj_korisnika`, { korisnicko_ime });
  }

  odbijKorisnika(korisnicko_ime: string) {
    return this.http.post<{ message: string }>(`${this.uri}/odbij_korisnika`, { korisnicko_ime });
  }

}
