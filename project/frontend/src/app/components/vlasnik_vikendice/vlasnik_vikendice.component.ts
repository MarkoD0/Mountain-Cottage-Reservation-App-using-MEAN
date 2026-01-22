import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VikendicaService } from '../../services/vikendica.service';
import { Vikendica } from '../../models/vikendica';
import { Korisnik } from '../../models/korisnik'
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-vlasnik_vikendice',
    standalone: true,
    imports: [FormsModule, RouterLink, CommonModule, DatePipe, NgIf, NgFor, DecimalPipe],
    templateUrl: './vlasnik_vikendice.component.html',
    styleUrl: './vlasnik_vikendice.component.css'
    })
    export class VlasnikVikendiceComponent implements OnInit {

    private vikendicaService = inject(VikendicaService)
    private backendUrl = 'http://localhost:4000';

    sveVikendice: Vikendica[] = [];
    ulogovan: Korisnik | null = null;
    porukaGreske: string = '';

    modAzuriranja: boolean = false;
    modDodavanja: boolean = false;
    vikendicaZaUredjivanje: Vikendica | null = null;
    originalnaVikendica: Vikendica | null = null;
    novaVikendica: any = null;

    uslugeInput: string = '';
    cenovnikPeriodInput: string = '';
    cenovnikCenaInput: string = '';

    noveSlike: File[] = [];
    porukaUspeh: string = '';
    poruka: string = '';

    ngOnInit(): void {
        let korisnikData = localStorage.getItem('ulogovan');
        if (korisnikData) {
            try {
                this.ulogovan = JSON.parse(korisnikData);
                this.dohvatiVikendiceVlasnika();
            } catch (e) {
                console.error('Greska pri parsiranju ulogovanog korisnika iz localStorage-a', e);
                this.ulogovan = null;
            }
        }
    }

    dohvatiVikendiceVlasnika(): void {
        if (this.ulogovan?.korisnicko_ime) {
            this.vikendicaService.dohvatiVikendiceVlasnika(this.ulogovan.korisnicko_ime).subscribe({
                next: (vikendice) => {
                    this.sveVikendice = vikendice;
                    this.porukaGreske = '';
                },
                error: (err) => {
                    console.error('Greska pri dohvatanju vikendica:', err);
                    this.porukaGreske = 'Doslo je do greske prilikom ucitavanja vikendica.';
                }
            });
        }
    }

    obrisiVikendicu(idVikendice: number): void {
        if (this.ulogovan?.korisnicko_ime) {
            if (confirm('Da li ste sigurni da zelite da obrisete ovu vikendicu?')) {
                this.vikendicaService.obrisiVikendicu(idVikendice).subscribe({
                    next: (res) => {
                        alert(res.message);
                        this.dohvatiVikendiceVlasnika();
                    },
                    error: (err) => {
                        console.error('Greska pri brisanju vikendice:', err);
                        alert(`Greska: ${err.error.message || 'Neuspesno brisanje vikendice.'}`);
                    }
                });
            }
        }
    }

    urediVikendicu(idVikendice: number): void {
        const vikendica = this.sveVikendice.find(v => v.idVikendice === idVikendice);
        if (vikendica) {
            this.originalnaVikendica = JSON.parse(JSON.stringify(vikendica));
            this.vikendicaZaUredjivanje = JSON.parse(JSON.stringify(vikendica));

            this.uslugeInput = this.vikendicaZaUredjivanje?.usluge?.join(', ') || '';
            this.cenovnikPeriodInput = this.vikendicaZaUredjivanje?.cenovnik_period?.join(', ') || '';
            this.cenovnikCenaInput = this.vikendicaZaUredjivanje?.cenovnik_cena?.join(', ') || '';
            
            this.modAzuriranja = true;
            this.poruka = '';
            this.porukaUspeh = '';
            this.noveSlike = [];
        } else {
            this.porukaGreske = 'Vikendica za uredjivanje nije pronadjena.';
        }
    }

    odustaniUredjivanje(): void {
        this.modAzuriranja = false;
        this.vikendicaZaUredjivanje = null;
        this.originalnaVikendica = null;
        this.noveSlike = [];
        this.poruka = '';
        this.porukaUspeh = '';
    }

    getImageUrl(slika: string): string {
        if (!slika) return ''; 
        return `${this.backendUrl}/slike/${slika}`; 
    }

/*
    onFilesSelected(event: any): void {
        this.poruka = '';
        this.noveSlike = []; 
        const files: FileList = event.target.files;

        if (!files || files.length === 0) return;

        if (files.length > 5) {
            this.poruka = 'Greska: Mozete odabrati najvise 5 novih slika.';
            event.target.value = null;
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
                this.poruka = `Greska: Fajl ${file.name} nije JPG ili PNG format.`;
                this.noveSlike = [];
                event.target.value = null;
                return;
            }
            this.noveSlike.push(file);
        }
    }
*/

    private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const img = new Image();
                img.onload = () => {
                    resolve({ width: img.width, height: img.height });
                };
                img.onerror = (error) => {
                    reject(new Error('Greska pri ucitavanju slike'));
                };
                img.src = e.target.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async onFilesSelected(event: any): Promise<void> {
        this.poruka = '';
        this.noveSlike = [];
        const files: FileList = event.target.files;

        if (!files || files.length === 0) return;

        if (files.length > 5) {
            this.poruka = 'Greska: Mozete odabrati najvise 5 novih slika.';
            event.target.value = null;
            return;
        }

        const fileArray: File[] = Array.from(files);
        const validFiles: File[] = [];

        for (const file of fileArray) {
            if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
                this.poruka = `Greska: Fajl ${file.name} nije JPG ili PNG format.`;
                this.noveSlike = [];
                event.target.value = null;
                return;
            }

            try {
                const dimensions = await this.getImageDimensions(file);
                const { width, height } = dimensions;

                if (width >= 100 && width <= 300 && height >= 100 && height <= 300) {
                    validFiles.push(file);
                } else {
                    this.poruka = `Greska: Slika ${file.name} mora biti izmedju 100x100 i 300x300 piksela. Trenutne dimenzije: ${width}x${height}.`;
                    this.noveSlike = [];
                    event.target.value = null;
                    return;
                }
            } catch (error) {
                console.error("Greška pri citanju dimenzija slike:", error);
                this.poruka = `Greska pri citanju dimenzija za sliku ${file.name}.`;
                this.noveSlike = [];
                event.target.value = null;
                return;
            }
        }

        this.noveSlike = validFiles;
        this.porukaUspeh = `Uspešno odabrano ${this.noveSlike.length} slika za dodavanje.`;
    }

    ukloniPostojecuSliku(slikaUrl: string): void {
        if (confirm('Da li ste sigurni da zelite da uklonite sliku?')) {
            if (this.vikendicaZaUredjivanje?.slike) {
                const index = this.vikendicaZaUredjivanje.slike.indexOf(slikaUrl);
                if (index > -1) {
                    this.vikendicaZaUredjivanje.slike.splice(index, 1);
                }
            }
        }
    }
    
    private stringToCleanedArray(input: string, type: 'string' | 'number'): any[] {
        if (!input) return [];
        
        const parts = input.split(/,\s*|\n/).map(s => s.trim()).filter(s => s.length > 0);
        
        if (type === 'number') {
            const numbers = parts.map(s => parseFloat(s)).filter(n => !isNaN(n) && n >= 0);
            return numbers;
        }
        return parts;
    }


    azurirajVikendicu(): void {
        if (!this.vikendicaZaUredjivanje) return;

        this.poruka = '';
        this.porukaUspeh = '';

        const u = this.vikendicaZaUredjivanje;
        
        u.usluge = this.stringToCleanedArray(this.uslugeInput, 'string');
        u.cenovnik_period = this.stringToCleanedArray(this.cenovnikPeriodInput, 'string');
        u.cenovnik_cena = this.stringToCleanedArray(this.cenovnikCenaInput, 'number');

        if (!u.naziv || !u.mesto || !u.telefon) {
            this.poruka = 'Naziv, mesto i telefon su obavezni podaci.';
            return;
        }
        if (u.cenovnik_period.length !== u.cenovnik_cena.length) {
            this.poruka = 'Broj unesenih perioda i cena u cenovniku mora biti jednak.';
            return;
        }
        
        const formData = new FormData();
        formData.append('idVikendice', u.idVikendice.toString());
        formData.append('naziv', u.naziv);
        formData.append('mesto', u.mesto);
        formData.append('telefon', u.telefon || '');
        
        formData.append('usluge', JSON.stringify(u.usluge));
        formData.append('cenovnik_period', JSON.stringify(u.cenovnik_period));
        formData.append('cenovnik_cena', JSON.stringify(u.cenovnik_cena));
        
        if (u.koordinate) {
            formData.append('koordinate_lat', u.koordinate.lat?.toString() || '');
            formData.append('koordinate_lng', u.koordinate.lng?.toString() || '');
        }

        formData.append('status', u.status);
        
        formData.append('postojeceSlike', JSON.stringify(u.slike || []));

        this.noveSlike.forEach(file => {
            formData.append('noveSlike', file, file.name);
        });

        this.vikendicaService.azurirajVikendicu(formData).subscribe({
            next: (response: any) => {
                alert(response.message);
                this.dohvatiVikendiceVlasnika();
                this.porukaUspeh = 'Podaci o vikendici su uspešno azurirani!';
                this.odustaniUredjivanje();
            },
            error: (err: any) => {
                console.error(err);
                this.poruka = err.error.message || 'Greska prilikom azuriranja. Proverite unete podatke.';
            }
        });
    }

    dodajVikendicu(): void {
        if (!this.ulogovan) {
            this.porukaGreske = 'Morate biti ulogovani da biste dodali vikendicu.';
            return;
        } 
        
        this.odustaniMod();

        this.modDodavanja = true;

        this.novaVikendica = {
            naziv: '',
            mesto: '',
            telefon: this.ulogovan.telefon || '',
            koordinate: { lat: 0, lng: 0 },
            usluge: [],
            cenovnik_period: [],
            cenovnik_cena: [],
            slike: [],
            srednja_ocena: 0,
            status: 'aktivna', 
            vlasnik_korisnicko_ime: this.ulogovan.korisnicko_ime
        };
    }

    odustaniMod(): void {
        this.modAzuriranja = false;
        this.modDodavanja = false;
        this.vikendicaZaUredjivanje = null;
        this.originalnaVikendica = null;
        this.novaVikendica = null;
        this.noveSlike = [];
        this.poruka = '';
        this.porukaUspeh = '';
        this.uslugeInput = '';
        this.cenovnikPeriodInput = '';
        this.cenovnikCenaInput = '';
    }

    sacuvajNovuVikendicu(): void {
        if (!this.novaVikendica || !this.ulogovan) return;

        this.poruka = '';
        this.porukaUspeh = '';

        const n = this.novaVikendica;

        n.usluge = this.stringToCleanedArray(this.uslugeInput, 'string');
        n.cenovnik_period = this.stringToCleanedArray(this.cenovnikPeriodInput, 'string');
        n.cenovnik_cena = this.stringToCleanedArray(this.cenovnikCenaInput, 'number');

        if (!n.naziv || !n.mesto || !n.telefon) {
            this.poruka = 'Naziv, mesto i telefon su obavezni podaci.';
            return;
        }

        if (n.cenovnik_period.length < 2 || n.cenovnik_cena.length < 2) {
            this.poruka = 'Cenovnik mora sadrzati minimum dve razlicite cene.';
            return;
        }
        if (n.cenovnik_period.length !== n.cenovnik_cena.length) {
            this.poruka = 'Broj unesenih perioda i cena u cenovniku mora biti jednak.';
            return;
        }

        const formData = new FormData();
        formData.append('naziv', n.naziv);
        formData.append('mesto', n.mesto);
        formData.append('telefon', n.telefon);
        formData.append('vlasnik_korisnicko_ime', this.ulogovan.korisnicko_ime);

        formData.append('usluge', JSON.stringify(n.usluge));
        formData.append('cenovnik_period', JSON.stringify(n.cenovnik_period));
        formData.append('cenovnik_cena', JSON.stringify(n.cenovnik_cena));
        
        formData.append('koordinate_lat', n.koordinate.lat.toString());
        formData.append('koordinate_lng', n.koordinate.lng.toString());
        formData.append('status', n.status);

        this.noveSlike.forEach(file => {
            formData.append('slike', file, file.name);
        });

        this.vikendicaService.dodajVikendicu(formData).subscribe({
            next: (response: any) => {
                alert(response.message);
                this.dohvatiVikendiceVlasnika();
                this.porukaUspeh = 'Nova vikendica je uspesno kreirana!';
                this.odustaniMod();
            },
            error: (err: any) => {
                console.error(err);
                this.poruka = err.error.message || 'Greska prilikom dodavanja vikendice.';
            }
        });
    }

}
