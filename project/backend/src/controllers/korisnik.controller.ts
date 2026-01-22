import * as express from "express";
import bcrypt from "bcryptjs";
import KorisnikModel from "../models/korisnik";

export class KorisnikController {
    login = (req: express.Request, res: express.Response) => {
        let korisnicko_ime = req.body.korisnicko_ime;
        let lozinka = req.body.lozinka;
        KorisnikModel.findOne({ korisnicko_ime: korisnicko_ime })
            .then((user) => {
                if (!user) { res.status(400).json(null); }
                else {
                    if (user.status !== 'aktivan') { res.status(400).json(null); }
                    else {
                        bcrypt.compare(lozinka, user.lozinka)
                            .then((isMatch) => {
                                if (!isMatch) { res.status(400).json(null); }//lozinka se ne podudara
                                else { res.json(user); }
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({ message: "Greška prilikom provere lozinke." });
                            });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(400).json({ message: 'Server error' });
            });
    };

    register = (req: express.Request, res: express.Response) => {
        let korisnikData = req.body;
        let slikaFilename = req.file ? req.file.filename : 'default.png';
        let status = req.body.status ? req.body.status : 'ceka';
        
        const lozinka = korisnikData.lozinka;
        bcrypt.hash(lozinka, 10)
            .then((hashedLozinka) => {
                let korisnik = {
                    korisnicko_ime: korisnikData.korisnicko_ime,
                    lozinka: hashedLozinka,
                    tip: korisnikData.tip,
                    ime: korisnikData.ime,
                    prezime: korisnikData.prezime,
                    pol: korisnikData.pol,
                    adresa: korisnikData.adresa,
                    telefon: korisnikData.telefon,
                    mejl: korisnikData.mejl,
                    kartica: korisnikData.kartica,
                    status: status,
                    slika: slikaFilename
                };
                new KorisnikModel(korisnik).save()
                    .then(() => {
                        res.status(200).json({ message: "Zahtev za registraciju je uspešno poslat." });
                    })
                    .catch((err) => {
                        console.log(err);
                        let message = "Greška na serveru. Korisničko ime ili e-mail možda već postoje.";
                        if (err.code === 11000) {
                            message = "Korisničko ime ili e-mail adresa su već zauzeti.";
                        }
                        res.status(400).json({ message: message });
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom šifrovanja lozinke." });
            });
    };

    getUser = (req: express.Request, res: express.Response) => {
        let korisnicko_ime = req.params.korisnicko_ime;
        KorisnikModel.findOne({ korisnicko_ime: korisnicko_ime })
            .then((user) => {
                res.json(user).status(200);
            })
            .catch((err) => {
                console.log(err);
                res.json({message: "Fail"}).status(400)
            });
    };

    promena_lozinke = (req: express.Request, res: express.Response) => {
        let korisnicko_ime = req.body.korisnicko_ime;
        let lozinka_stara = req.body.lozinka_stara;
        let lozinka_nova = req.body.lozinka_nova;

        KorisnikModel.findOne({ korisnicko_ime: korisnicko_ime })
            .then((user) => {
                if (!user) { res.status(400).json({ message: "Korisnik ne postoji." }); }
                else {
                    bcrypt.compare(lozinka_stara, user.lozinka)
                        .then((isMatch) => {
                            if (!isMatch) { res.status(400).json({ message: "Stara lozinka nije ispravna." }); }//lozinka se ne podudara
                            else {
                                bcrypt.hash(lozinka_nova, 10)
                                .then((hashedLozinka) => {
                                    KorisnikModel.updateOne({ korisnicko_ime: korisnicko_ime }, { $set: { lozinka: hashedLozinka } })
                                    .then(() => {
                                        res.status(200).json({ message: "Lozinka uspešno promenjena" });
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        res.status(500).json({ message: "Greška prilikom čuvanja nove lozinke." });
                                    });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    res.status(500).json({ message: "Greška prilikom šifrovanja nove lozinke." });
                                });
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json({ message: "Greška prilikom provere lozinke." });
                        });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(400).json({ message: 'Server error' });
            });
    };

    brojKorisnikaPoTipu = (req: express.Request, res: express.Response) => {
        Promise.all([
            KorisnikModel.countDocuments({ tip: 'vlasnik', status: 'aktivan' }),
            KorisnikModel.countDocuments({ tip: 'turista', status: 'aktivan' })
        ])
            .then(([brojVlasnika, brojTurista]) => {
                res.status(200).json({ 
                    brojVlasnika: brojVlasnika, 
                    brojTurista: brojTurista 
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom brojanja korisnika." });
            });
    };

    azurirajProfil = (req: express.Request, res: express.Response) => {
        const korisnicko_ime = req.body.korisnicko_ime;
        const updateData: any = {
            ime: req.body.ime,
            prezime: req.body.prezime,
            pol: req.body.pol,
            adresa: req.body.adresa,
            telefon: req.body.telefon,
            mejl: req.body.mejl,
            kartica: req.body.kartica
        };

        if (req.file && req.file.filename) {
            updateData.slika = req.file.filename;
        }

        KorisnikModel.findOneAndUpdate({ korisnicko_ime: korisnicko_ime }, { $set: updateData }, { new: true })
            .then((updatedUser) => {
                if (!updatedUser) {
                    return res.status(404).json({ message: "Korisnik nije pronaden." });
                }
                res.status(200).json({ message: "Podaci uspesno azurirani.", korisnik: updatedUser });
            })
            .catch((err) => {
                console.log(err);
                let message = "Greska prilikom azuriranja profila.";
                if (err.code === 11000) {
                    message = "E-mail adresa je vec zauzeta.";
                }
                res.status(400).json({ message: message });
            });
    };
    
    dohvatiSveTuriste = (req: express.Request, res: express.Response) => {
        KorisnikModel.find({ tip: 'turista' })
            .then((turisti) => {
                res.status(200).json(turisti);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom dohvatanja turista." });
            });
    };
    
    dohvatiSveVlasnike = (req: express.Request, res: express.Response) => {
        KorisnikModel.find({ tip: 'vlasnik' })
            .then((vlasnici) => {
                res.status(200).json(vlasnici);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom dohvatanja vlasnika." });
            });
    };

    aktivirajKorisnika = (req: express.Request, res: express.Response) => {
        const korisnicko_ime = req.body.korisnicko_ime;
        KorisnikModel.updateOne({ korisnicko_ime: korisnicko_ime }, { $set: { status: 'aktivan' } })
            .then(() => {
                res.status(200).json({ message: "Korisnik uspešno aktiviran." });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom aktivacije korisnika." });
            });
    };

    blokirajKorisnika = (req: express.Request, res: express.Response) => {
        const korisnicko_ime = req.body.korisnicko_ime;
        KorisnikModel.updateOne({ korisnicko_ime: korisnicko_ime }, { $set: { status: 'blokiran' } })
            .then(() => {
                res.status(200).json({ message: "Korisnik uspešno blokiran." });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom blokiranja korisnika." });
            });
    };

    odbijKorisnika = (req: express.Request, res: express.Response) => {
        const korisnicko_ime = req.body.korisnicko_ime;
        KorisnikModel.updateOne({ korisnicko_ime: korisnicko_ime }, { $set: { status: 'odbijen' } })
            .then(() => {
                res.status(200).json({ message: "Korisnik uspešno odbijen." });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Greška prilikom odbijanja korisnika." });
            });
    };

}
