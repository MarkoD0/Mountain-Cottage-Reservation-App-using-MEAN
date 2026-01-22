import express from "express";
import { RezervacijaController } from "../controllers/rezervacija.controller";
import multer from 'multer';
import path from 'path';

const rezervacijaRouter = express.Router();

rezervacijaRouter
    .route("/broj_rezervacija_po_vremenu")
    .get((req, res) => new RezervacijaController().brojRezervacijaPoVremenu(req, res));

rezervacijaRouter
    .route("/kreiraj")
    .post((req, res) => new RezervacijaController().kreirajRezervaciju(req, res));

rezervacijaRouter
    .route("/turista/:korisnicko_ime")
    .get((req, res) => new RezervacijaController().dohvatiRezervacijeTuriste(req, res));

rezervacijaRouter
    .route("/vlasnik_neobradjene/:vlasnik_korisnicko_ime")
    .get((req, res) => new RezervacijaController().dohvatiNeobradjeneRezervacijeVlasnika(req, res));

rezervacijaRouter
    .route("/obradi")
    .post((req, res) => new RezervacijaController().obradiRezervaciju(req, res));

export default rezervacijaRouter;
