import mongoose from "mongoose";

const Schema = mongoose.Schema;

let Korisnik = new Schema({
    korisnicko_ime: { type: String, unique: true, required: true },
    lozinka: { type: String, required: true },
    tip: { type: String, required: true },
    ime: { type: String, required: true },
    prezime: { type: String, required: true },
    pol: { type: String },
    adresa: { type: String },
    telefon: { type: String },
    mejl: { type: String, unique: true, required: true },
    kartica: { type: String },
    slika: { type: String, default: 'default.png' },
    status: { type: String, default: 'ceka' }       // 'ceka', 'aktivan', 'blokiran', 'odbijen'
},{versionKey:false});

export default mongoose.model("KorisnikModel", Korisnik, "korisnici");
