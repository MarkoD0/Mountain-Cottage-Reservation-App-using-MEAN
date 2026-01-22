import * as express from "express";
import bcrypt from "bcryptjs";
import * as fs from 'fs';
import * as path from 'path';
import VikendicaModel from "../models/vikendica";

function obrisiSliku(slikaNaziv: string): void {
    const slikaPut = path.join(__dirname, 'slike', slikaNaziv); 
    fs.unlink(slikaPut, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`Upozorenje: Slika ${slikaNaziv} već ne postoji na putanji. Nastavljam.`);
            } else {
                console.warn(`Greška prilikom brisanja slike ${slikaNaziv}: ${err.message}`);
            }
        } else {
            console.log(`Uspešno obrisana slika: ${slikaNaziv}`);
        }
    });
}

export class VikendicaController {
    
    brojAktivnihVikendica = (req: express.Request, res: express.Response) => {
        VikendicaModel.countDocuments({ status: 'aktivna' })
            .then((count) => {
                res.status(200).json({ count: count });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom brojanja vikendica." });
            });
    }

    dohvatiSveVikendice = (req: express.Request, res: express.Response) => {
        VikendicaModel.find({ status: 'aktivna' })
            .then((vikendice) => {
                res.status(200).json(vikendice);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom dohvatanja vikendica." });
            });
    }

    dohvatiSveVikendiceIBlokirane = (req: express.Request, res: express.Response) => {
        VikendicaModel.find({})
            .then((vikendice) => {
                res.status(200).json(vikendice);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom dohvatanja vikendica." });
            });
    }

    dohvatiVikendice = (req: express.Request, res: express.Response) => {
        let naziv = req.query.naziv;
        let mesto = req.query.mesto;
        
        let filter: any = { status: 'aktivna' };
        if (naziv) { filter.naziv = { $regex: new RegExp(naziv as string, 'i') }; }
        if (mesto) { filter.mesto = { $regex: new RegExp(mesto as string, 'i') }; }

        VikendicaModel.find(filter)
            .then((vikendice) => {
                res.status(200).json(vikendice);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom dohvatanja vikendica sa filterima." });
            });
    }

    dohvatiDetaljeVikendice = (req: express.Request, res: express.Response) => {
        let idV = req.params.id;
        let id = parseInt(idV);

        VikendicaModel.findOne({ idVikendice: id, status: 'aktivna' })
            .then((vikendica) => {
                if (!vikendica) {
                    return res.status(404).json({ message: "Vikendica nije pronađena ili nije aktivna." });
                }
                res.status(200).json(vikendica);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom dohvatanja detalja vikendice." });
            });
    }

    dohvatiVikendiceVlasnika = (req: express.Request, res: express.Response) => {
        let korisnicko_ime = req.params.korisnicko_ime;

        VikendicaModel.find({ vlasnik_korisnicko_ime: korisnicko_ime })
            .then((vikendice) => {
                res.status(200).json(vikendice);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom dohvatanja vikendica vlasnika." });
            });
    }

    obrisiVikendicu = (req: express.Request, res: express.Response) => {
        let idVikendice = req.params.idVikendice;

        VikendicaModel.deleteOne({ idVikendice: idVikendice })
            .then((result) => {
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "Vikendica nije pronađena ili već obrisana." });
                }
                res.status(200).json({ message: "Vikendica je uspešno obrisana." });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom brisanja vikendice." });
            });
    };

    azurirajVikendicu = (req: express.Request, res: express.Response) => {
        const { idVikendice, naziv, mesto, telefon, status, koordinate_lat, koordinate_lng, postojeceSlike } = req.body;
        
        let usluge: string[] = [];
        let cenovnik_period: string[] = [];
        let cenovnik_cena: number[] = [];

        try {
            usluge = JSON.parse(req.body.usluge);
            cenovnik_period = JSON.parse(req.body.cenovnik_period);
            cenovnik_cena = JSON.parse(req.body.cenovnik_cena).map((c: any) => parseFloat(c)); 
        } catch (e) {
            res.status(400).json({ message: "Neispravan format cenovnika ili usluga." });
        }
        
        let finalneSlike: string[] = [];
        try {
            finalneSlike = JSON.parse(postojeceSlike);
        } catch (e) {
            finalneSlike = []; 
        }

        const noveSlikeFajlovi = (req.files as Express.Multer.File[]) || [];
        const noviNaziviSlika = noveSlikeFajlovi.map(file => file.filename);

        const azuriranaListaSlika = [...finalneSlike, ...noviNaziviSlika];

        const updateData: any = {
            naziv: naziv,
            mesto: mesto,
            telefon: telefon,
            usluge: usluge,
            cenovnik_period: cenovnik_period,
            cenovnik_cena: cenovnik_cena,
            status: status,
            slike: azuriranaListaSlika
        };
        
        if (koordinate_lat && koordinate_lng) {
            updateData.koordinate = {
                lat: parseFloat(koordinate_lat),
                lng: parseFloat(koordinate_lng)
            };
        }

        VikendicaModel.findOne({ idVikendice: idVikendice })
        .then(originalnaVikendica => {
            if (!originalnaVikendica) {
                noveSlikeFajlovi.forEach(file => obrisiSliku(file.filename));
                res.status(404).json({ message: "Vikendica nije pronađena." });
            }

            let slikeZaBrisanje = originalnaVikendica?.slike.filter(slika => !finalneSlike.includes(slika));

            return VikendicaModel.findOneAndUpdate(
                { idVikendice: idVikendice }, 
                { $set: updateData }, 
                { new: true, runValidators: true }
            )
            .then((azuriranaVikendica) => {
                slikeZaBrisanje?.forEach(obrisiSliku);

                res.status(200).json({ 
                    message: "Vikendica uspešno ažurirana.", 
                    vikendica: azuriranaVikendica 
                });
            })
        })
        .catch((err) => {
            console.error("Greška pri ažuriranju vikendice:", err);
            noveSlikeFajlovi.forEach(file => obrisiSliku(file.filename));
            res.status(500).json({ message: "Greška prilikom ažuriranja vikendice. Proverite unete podatke." });
        });
    }
    
    dodajVikendicu = (req: express.Request, res: express.Response) => {
        const { naziv, mesto, telefon, koordinate_lat, koordinate_lng, vlasnik_korisnicko_ime } = req.body;
        
        if (!naziv || !mesto || !vlasnik_korisnicko_ime) {
            const uploadovaniFajlovi = (req.files as Express.Multer.File[]) || [];
            uploadovaniFajlovi.forEach(file => obrisiSliku(file.filename));
            res.status(400).json({ message: "Nedostaju obavezna polja: naziv, mesto i vlasnik_korisnicko_ime." });
        }

        let usluge: string[] = [];
        let cenovnik_period: string[] = [];
        let cenovnik_cena: number[] = [];

        try {
            usluge = req.body.usluge ? JSON.parse(req.body.usluge) : [];
            cenovnik_period = req.body.cenovnik_period ? JSON.parse(req.body.cenovnik_period) : [];
            cenovnik_cena = req.body.cenovnik_cena ? JSON.parse(req.body.cenovnik_cena).map((c: any) => parseFloat(c)) : []; 
        } catch (e) {
            const uploadovaniFajlovi = (req.files as Express.Multer.File[]) || [];
            uploadovaniFajlovi.forEach(file => obrisiSliku(file.filename));
            res.status(400).json({ message: "Neispravan format cenovnika ili usluga." });
        }

        const slikeFajlovi = (req.files as Express.Multer.File[]) || [];
        const naziviSlika = slikeFajlovi.map(file => file.filename);

        VikendicaModel.findOne({}, {}, { sort: { 'idVikendice' : -1 } })
            .then((poslednjaVikendica) => {
            const nextId = poslednjaVikendica ? poslednjaVikendica.idVikendice + 1 : 1;
            
            const novaVikendica = new VikendicaModel({
                idVikendice: nextId,
                naziv: naziv,
                mesto: mesto,
                telefon: telefon,
                usluge: usluge,
                cenovnik_period: cenovnik_period,
                cenovnik_cena: cenovnik_cena,
                vlasnik_korisnicko_ime: vlasnik_korisnicko_ime,
                status: 'aktivna',
                slike: naziviSlika,
                koordinate: (koordinate_lat && koordinate_lng) ? {
                    lat: parseFloat(koordinate_lat),
                    lng: parseFloat(koordinate_lng)
                } : undefined
            });
            
            return novaVikendica.save();
        })
        .then((sacuvanaVikendica) => {
            res.status(201).json({ 
                message: "Vikendica je uspešno dodata.", 
                vikendica: sacuvanaVikendica 
            });
        })
        .catch((err) => {
            console.error("Greška pri dodavanju vikendice:", err);
            const uploadovaniFajlovi = (req.files as Express.Multer.File[]) || [];
            uploadovaniFajlovi.forEach(file => obrisiSliku(file.filename));
            res.status(500).json({ message: "Greška prilikom dodavanja vikendice. Proverite unete podatke." });
        });
    }

    blokirajVikendicu = (req: express.Request, res: express.Response) => {
        let idVikendice = req.params.idVikendice;
        VikendicaModel.findOneAndUpdate(
            { idVikendice: idVikendice },
            { $set: { status: 'blokirana' } },
            { new: true }
        )
        .then((azuriranaVikendica) => {
            if (!azuriranaVikendica) {
                return res.status(404).json({ message: "Vikendica nije pronađena." });
            }
            res.status(200).json({ message: "Vikendica je uspešno blokirana." });
        })
        .catch((err) => {
            console.error("Greška pri blokiranju vikendice:", err);
            res.status(500).json({ message: "Greška prilikom blokiranja vikendice." });
        });
    }

}
