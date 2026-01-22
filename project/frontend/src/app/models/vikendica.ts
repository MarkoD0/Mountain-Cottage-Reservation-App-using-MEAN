export class Vikendica {
    idVikendice: number = 0;
    naziv: string = '';
    mesto: string = '';
    usluge: string[] = [];
    cenovnik_period: string[] = [];
    cenovnik_cena: number[] = [];
    telefon: string = '';
    koordinate: { lat: number, lng: number } = { lat: 0, lng: 0 };
    ocene_niz: number[] = [];
    srednja_ocena: number = 0;
    vlasnik_korisnicko_ime: string = '';
    status: string = 'aktivna';
    slike: string[] = [];
}