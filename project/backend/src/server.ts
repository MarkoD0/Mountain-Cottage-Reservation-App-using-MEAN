import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as path from 'path';
import korisnikRouter from "./routers/korisnik.router";
import rezervacijaRouter from "./routers/rezervacija.router";
import vikendicaRouter from "./routers/vikendica.router";

const app = express();
app.use(cors());
app.use(express.json());

const staticPath = path.join(process.cwd(), 'src/slike');
app.use('/slike', express.static(path.join(staticPath)));

mongoose.connect("mongodb://127.0.0.1:27017/planinska_vikendica");
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("db connection ok");
});

const router = express.Router();
router.use("/korisnici", korisnikRouter);
router.use("/rezervacije", rezervacijaRouter);
router.use("/vikendice", vikendicaRouter);

app.use("/", router);

app.listen(4000, () => console.log(`Express server running on port 4000`));
