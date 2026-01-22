import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Vikendica } from '../models/vikendica';

@Injectable({
  providedIn: 'root'
})
export class VikendicaService {
  uri = 'http://localhost:4000/vikendice';

  constructor() { }

  private http = inject(HttpClient)

  dohvatiBrojAktivnihVikendica() {
    return this.http.get<{count: number}>(`${this.uri}/broj_aktivnih`);
  }
  
  dohvatiSveVikendice() {
    return this.http.get<Vikendica[]>(`${this.uri}/sve_vikendice`);
  }

  dohvatiSveVikendiceIBlokirane() {
    return this.http.get<Vikendica[]>(`${this.uri}/sve_vikendice_i_blokirane`);
  }

  dohvatiVikendice(naziv: string, mesto: string) {
    let params = new HttpParams();
    if (naziv) { params = params.append('naziv', naziv); }
    if (mesto) { params = params.append('mesto', mesto); }
    return this.http.get<Vikendica[]>(`${this.uri}/dohvati_vikendice`, { params: params });
  }

  dohvatiDetaljeVikendice(idVikendice: number) {
    return this.http.get<Vikendica>(`${this.uri}/detalji/${idVikendice}`);
  }

  dohvatiVikendiceVlasnika(korisnicko_ime: string) {
    return this.http.get<Vikendica[]>(`${this.uri}/vikendice_vlasnika/${korisnicko_ime}`);
  }

  obrisiVikendicu(idVikendice: number) {
    return this.http.delete<{ message: string }>(`${this.uri}/obrisi/${idVikendice}`);
  }

  azurirajVikendicu(formData: FormData) {
    return this.http.post<{ message: string, vikendica: Vikendica }>(`${this.uri}/azuriraj`, formData);
  }

  dodajVikendicu(formData: FormData) {
    return this.http.post<{ message: string, vikendica: Vikendica }>(`${this.uri}/dodaj`, formData);
  }

  blokirajVikendicu(idVikendice: number) {
    return this.http.post<{ message: string }>(`${this.uri}/blokiraj/${idVikendice}`, {});
  }

}
