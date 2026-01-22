import { Time } from "@angular/common";

export class Rezervacija {
    idRezervacije: number = 0;
    idVikendice: number = 0;
    turista_korisnicko_ime: string = '';
    vikendica_naziv: string = '';
    vikendica_mesto: string = '';
    vlasnik_korisnicko_ime: string = '';
    datum_rezervisanja: string = ''; 
    datum_od: string = '';
    datum_do: string = '';
    komentar: string = '';
    ocena: number = 0;
    cena: number = 0;
    broj_ljudi: number = 0;
    status: string = 'ceka'; // ceka, odobrena, odbijena
}