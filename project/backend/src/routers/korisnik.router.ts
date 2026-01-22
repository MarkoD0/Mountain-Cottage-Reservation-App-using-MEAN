import express from "express";
import { KorisnikController } from "../controllers/korisnik.controller";
import multer from 'multer';
import path from 'path';

const korisnikRouter = express.Router();

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

korisnikRouter
  .route("/login")
  .post((req, res) => new KorisnikController().login(req, res));

korisnikRouter
  .route("/register")
  .post(upload.single('profilnaSlika'),(req, res) => new KorisnikController().register(req, res));

korisnikRouter
  .route("/getUser/:korisnicko_ime")
  .get((req, res) => new KorisnikController().getUser(req, res));

korisnikRouter
  .route("/promena_lozinke")
  .post((req, res) => new KorisnikController().promena_lozinke(req, res));

korisnikRouter
  .route("/broj_korisnika_po_tipu")
  .get((req, res) => new KorisnikController().brojKorisnikaPoTipu(req, res));
  
korisnikRouter
  .route("/azuriraj_profil")
  .post(upload.single('profilnaSlika'), (req, res) => new KorisnikController().azurirajProfil(req, res));
  
korisnikRouter
  .route("/sve_turiste")
  .get((req, res) => new KorisnikController().dohvatiSveTuriste(req, res));
  
korisnikRouter
  .route("/sve_vlasnike")
  .get((req, res) => new KorisnikController().dohvatiSveVlasnike(req, res));

korisnikRouter
  .route("/aktiviraj_korisnika")
  .post((req, res) => new KorisnikController().aktivirajKorisnika(req, res));

korisnikRouter
  .route("/blokiraj_korisnika")
  .post((req, res) => new KorisnikController().blokirajKorisnika(req, res));

korisnikRouter
  .route("/odbij_korisnika")
  .post((req, res) => new KorisnikController().odbijKorisnika(req, res));

export default korisnikRouter;
