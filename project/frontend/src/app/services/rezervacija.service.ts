import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Rezervacija } from '../models/rezervacija';

@Injectable({
  providedIn: 'root'
})
export class RezervacijaService {
  uri = 'http://localhost:4000/rezervacije';

  constructor() { }

  private http = inject(HttpClient)

  dohvatiBrojRezervacija() {
    return this.http.get<{ brojRezervisanih24h: number; brojRezervisanih7d: number; brojRezervisanih30d: number }>(`${this.uri}/broj_rezervacija_po_vremenu`);
  }

  kreirajRezervaciju(rezervacijaData: Rezervacija) {
    return this.http.post<{ rezervacija: Rezervacija, message: string }>(`${this.uri}/kreiraj`, rezervacijaData);
  }

  dohvatiRezervacijeTuriste(korisnicko_ime: string) {
    return this.http.get<Rezervacija[]>(`${this.uri}/turista/${korisnicko_ime}`);
  }

  dohvatiNeobradjeneRezervacijeVlasnika(vlasnik_korisnicko_ime: string) {
    return this.http.get<Rezervacija[]>(`${this.uri}/vlasnik_neobradjene/${vlasnik_korisnicko_ime}`);
  }

  obradiRezervaciju(idRezervacije: number, status: 'odobrena' | 'odbijena', komentar: string = '') {
    const data = { idRezervacije, status, komentar };
    return this.http.post<{ message: string, rezervacija: Rezervacija }>(`${this.uri}/obradi`, data);
  }

}
