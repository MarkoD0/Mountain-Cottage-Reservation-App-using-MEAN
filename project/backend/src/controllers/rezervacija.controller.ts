import * as express from "express";
import bcrypt from "bcryptjs";
import RezervacijaModel from "../models/rezervacija";
import mongoose from "mongoose";
import vikendica from "../models/vikendica";

export class RezervacijaController {
    
    brojRezervacijaPoVremenu = (req: express.Request, res: express.Response) => {
        const now = new Date();
        const date24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const date7dAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const date30dAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        Promise.all([
            RezervacijaModel.countDocuments({ datum_rezervisanja: { $gte: date24hAgo } }),
            RezervacijaModel.countDocuments({ datum_rezervisanja: { $gte: date7dAgo } }),
            RezervacijaModel.countDocuments({ datum_rezervisanja: { $gte: date30dAgo } })
        ])
            .then(([broj24h, broj7d, broj30d]) => {
                res.status(200).json({
                brojRezervisanih24h: broj24h,
                brojRezervisanih7d: broj7d,
                brojRezervisanih30d: broj30d
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Greška prilikom dohvatanja broja rezervacija." });
        });
    };

    kreirajRezervaciju = (req: express.Request, res: express.Response) => {
        const data = req.body;
        const idRezervacijeInt = Date.now();
        
        const datum_od_nova = new Date(data.datum_od);
        const datum_do_nova = new Date(data.datum_do);

        RezervacijaModel.findOne({
            idVikendice: data.idVikendice,
            status: { $in: ['ceka', 'odobrena'] },
            $and: [
                { datum_od: { $lt: datum_do_nova } },
                { datum_do: { $gt: datum_od_nova } }
            ]
        })
        .then((postojecaRezervacija) => {
            if (postojecaRezervacija) {
                if(postojecaRezervacija.datum_od && postojecaRezervacija.datum_do){
                    const preklapanjeOd = postojecaRezervacija.datum_od.toISOString().split('T')[0];
                    const preklapanjeDo = postojecaRezervacija.datum_do.toISOString().split('T')[0];
                
                    return res.status(400).json({ 
                        message: `Žao nam je, vikendica je već rezervisana. Vaš termin se preklapa sa postojećom rezervacijom koja traje od ${preklapanjeOd} do ${preklapanjeDo}.`
                    });
                }
            }

            const novaRezervacija = {
                idRezervacije: idRezervacijeInt,
                idVikendice: data.idVikendice,
                turista_korisnicko_ime: data.turista_korisnicko_ime,
                vikendica_naziv: data.vikendica_naziv,
                vikendica_mesto: data.vikendica_mesto,
                vlasnik_korisnicko_ime: data.vlasnik_korisnicko_ime,
                datum_rezervisanja: new Date(data.datum_rezervisanja),
                datum_od: datum_od_nova,
                datum_do: datum_do_nova,
                komentar: data.komentar,
                ocena: data.ocena,
                cena: data.cena,
                broj_ljudi: data.broj_ljudi,
                status: 'ceka' 
            };

            new RezervacijaModel(novaRezervacija).save()
                .then((newRezervation) => {
                    res.status(200).json({ rezervacija: newRezervation, message: "Rezervacija je uspešno kreirana i čeka obradu." });
                })
                .catch((err) => {
                    console.error("Greška prilikom kreiranja rezervacije:", err);
                    res.status(500).json({ message: "Greška prilikom snimanja rezervacije u bazu." });
                });
        })
        .catch((err) => {
            console.error("Greška prilikom provere preklapanja rezervacija:", err);
            res.status(500).json({ message: "Greška na serveru prilikom provere dostupnosti." });
        });
    };

    dohvatiRezervacijeTuriste = (req: express.Request, res: express.Response) => {
        const korisnicko_ime = req.params.korisnicko_ime;

        RezervacijaModel.find({ 
            turista_korisnicko_ime: korisnicko_ime 
        })
        .select({
            idRezervacije: 1,
            datum_od: 1,
            datum_do: 1,
            vikendica_naziv: 1,
            vikendica_mesto: 1,
            datum_rezervisanja: 1,
            komentar: 1,
            status: 1,
            cena: 1,
            broj_ljudi: 1
        })
        .sort({ 
            datum_rezervisanja: -1 
        })
        .then((rezervacije) => {
            res.status(200).json(rezervacije);
        })
        .catch((err) => {
            console.error("Greška prilikom dohvatanja rezervacija za turistu:", err);
            res.status(500).json({ message: "Greška prilikom dohvatanja rezervacija." });
        });
    };

    dohvatiNeobradjeneRezervacijeVlasnika = (req: express.Request, res: express.Response) => {
        const vlasnik_korisnicko_ime = req.params.vlasnik_korisnicko_ime;

        RezervacijaModel.find({
            vlasnik_korisnicko_ime: vlasnik_korisnicko_ime,
            status: 'ceka'
        })
        .sort({
            datum_rezervisanja: -1
        })
        .then((rezervacije) => {
            res.status(200).json(rezervacije);
        })
        .catch((err) => {
            console.error("Greška prilikom dohvatanja neobrađenih rezervacija za vlasnika:", err);
            res.status(500).json({ message: "Greška prilikom dohvatanja rezervacija." });
        });
    };

    obradiRezervaciju = (req: express.Request, res: express.Response) => {
        const { idRezervacije, status, komentar } = req.body;

        if (!idRezervacije || !status || !['odobrena', 'odbijena'].includes(status)) {
            res.status(400).json({ message: "Nedostaje ID rezervacije ili neispravan status." });
            return;
        }

        if (status === 'odbijena' && (!komentar || komentar.trim() === '')) {
            res.status(400).json({ message: "Komentar je obavezan prilikom odbijanja rezervacije." });
            return;
        }

        const updateData: any = { status: status };
        if (status === 'odbijena') {
            updateData.komentar = komentar;
        }

        RezervacijaModel.findOneAndUpdate(
            { idRezervacije: idRezervacije, status: 'ceka' },
            { $set: updateData },
            { new: true }
        )
        .then((rezervacija) => {
            if (!rezervacija) {
                res.status(404).json({ message: "Rezervacija nije pronađena ili je već obrađena." });
                return;
            }
            
            let poruka = (status === 'odobrena') ? "Rezervacija uspešno potvrđena." : "Rezervacija uspešno odbijena.";
            res.status(200).json({ message: poruka, rezervacija: rezervacija });
        })
        .catch((err) => {
            console.error("Greška prilikom obrade rezervacije:", err);
            res.status(500).json({ message: "Greška na serveru prilikom obrade rezervacije." });
        });
    };

}
