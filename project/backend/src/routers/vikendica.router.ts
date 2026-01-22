import express from "express";
import { VikendicaController } from "../controllers/vikendica.controller";
import multer from 'multer';
import path from 'path';

const vikendicaRouter = express.Router();

// Podešavanje za čuvanje slika
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/slike'); 
    },
    filename: (req, file, cb) => {
        // Generišemo jedinstveno ime fajla da se ne preklapaju
        // Format: <trenutnoVreme>-<originalnoImeFajla>
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

vikendicaRouter
    .route("/broj_aktivnih")
    .get((req, res) => new VikendicaController().brojAktivnihVikendica(req, res));

vikendicaRouter
    .route("/sve_vikendice")
    .get((req, res) => new VikendicaController().dohvatiSveVikendice(req, res));

vikendicaRouter
    .route("/sve_vikendice_i_blokirane")
    .get((req, res) => new VikendicaController().dohvatiSveVikendiceIBlokirane(req, res));

vikendicaRouter
    .route("/dohvati_vikendice")
    .get((req, res) => new VikendicaController().dohvatiVikendice(req, res));

vikendicaRouter
    .route("/detalji/:id")
    .get((req, res) => new VikendicaController().dohvatiDetaljeVikendice(req, res));

vikendicaRouter
    .route("/vikendice_vlasnika/:korisnicko_ime")
    .get((req, res) => new VikendicaController().dohvatiVikendiceVlasnika(req, res));

vikendicaRouter
    .route("/obrisi/:idVikendice")
    .delete((req, res) => new VikendicaController().obrisiVikendicu(req, res));

vikendicaRouter
    .route("/azuriraj")
    .post(upload.array('noveSlike', 5), (req, res) => new VikendicaController().azurirajVikendicu(req, res));

vikendicaRouter
    .route("/dodaj")
    .post(upload.array('slike', 5), (req, res) => new VikendicaController().dodajVikendicu(req, res));

vikendicaRouter
    .route("/blokiraj/:idVikendice")
    .post((req, res) => new VikendicaController().blokirajVikendicu(req, res));

export default vikendicaRouter;
