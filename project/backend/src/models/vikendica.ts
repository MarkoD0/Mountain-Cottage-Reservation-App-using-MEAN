import mongoose from "mongoose";

const Schema = mongoose.Schema;

let Vikendica = new Schema({
    idVikendice: { type: Number, required: true, unique: true },
    naziv: { type: String, required: true },
    mesto: { type: String, required: true },
    usluge: { type: [String] },
    cenovnik_period: { type: [String] },
    cenovnik_cena: { type: [Number] },
    telefon: { type: String },
    koordinate: { lat: Number, lng: Number }, // alternativno { type: String }
    ocene_niz: { type: [Number] },
    srednja_ocena: { type: Number, default: 0 },
    vlasnik_korisnicko_ime: { type: String, required: true },
    status: { type: String, enum: ['aktivna', 'blokirana'], default: 'aktivna' },
    slike: { type: [String] }
},{versionKey:false});

export default mongoose.model("VikendicaModel", Vikendica, "vikendice");
