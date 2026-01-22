import mongoose from "mongoose";

const Schema = mongoose.Schema;

let Rezervacija = new Schema({
    idRezervacije: { type: Number, required: true, unique: true },
    idVikendice: { type: Number },
    turista_korisnicko_ime: { type: String, required: true },
    vikendica_naziv: { type: String, required: true },
    vikendica_mesto: { type: String, required: true },
    vlasnik_korisnicko_ime: { type: String },
    datum_rezervisanja: { type: Date, required: true },
    datum_od: { type: Date },
    datum_do: { type: Date },
    komentar: { type: String },
    ocena: { type: Number },
    cena: { type: Number },
    broj_ljudi: { type: Number },
    status: { type: String, enum: ['ceka', 'odobrena', 'zavrsena', 'odbijena'], default: 'ceka' },
},{versionKey:false});

export default mongoose.model("RezervacijaModel", Rezervacija, "rezervacije");
