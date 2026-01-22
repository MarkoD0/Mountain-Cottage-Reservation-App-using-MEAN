import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { Admin_loginComponent } from './components/admin_login/admin_login.component';
import { RegisterComponent } from './components/register/register.component';
import { TuristaComponent } from './components/turista/turista.component';
import { VlasnikComponent } from './components/vlasnik/vlasnik.component';
import { AdminComponent } from './components/admin/admin.component';
import { Promena_lozinkeComponent } from './components/promena_lozinke/promena_lozinke.component';
import { ProfilComponent } from './components/profil/profil.component';
import { TuristaVikendiceComponent } from './components/turista_vikendice/turista_vikendice.component';
import { TuristaRezervacijeComponent } from './components/turista_rezervacije/turista_rezervacije.component';
import { DetaljiVikendiceComponent } from './components/detalji-vikendice/detalji-vikendice.component';
import { VlasnikVikendiceComponent } from './components/vlasnik_vikendice/vlasnik_vikendice.component';
import { VlasnikRezervacijeComponent } from './components/vlasnik_rezervacije/vlasnik_rezervacije.component';
import { VlasnikStatistikaComponent } from './components/vlasnik-statistika/vlasnik_statistika.component';
import { AdminKorisniciComponent } from './components/admin_korisnici/admin_korisnici.component';
import { AdminVikendiceComponent } from './components/admin_vikendice/admin_vikendice.component';
import { AdminKorisniciUrediComponent } from './components/admin_korisnici_uredi/admin_korisnici_uredi.component';


export const routes: Routes = [
    { path: "", component: LoginComponent },
    { path: "admin_login", component: Admin_loginComponent },
    {path: "register", component: RegisterComponent},
    { path: "turista", component: TuristaComponent },
    { path: "vlasnik", component: VlasnikComponent },
    { path: "admin", component: AdminComponent },
    { path: "promena_lozinke", component: Promena_lozinkeComponent },
    { path: "profil", component: ProfilComponent },
    { path: "turista_vikendice", component: TuristaVikendiceComponent },
    { path: "turista_rezervacije", component: TuristaRezervacijeComponent },
    { path: 'detalji/:id', component: DetaljiVikendiceComponent },
    { path: "vlasnik_rezervacije", component: VlasnikRezervacijeComponent },
    { path: "vlasnik_vikendice", component: VlasnikVikendiceComponent },
    { path: "vlasnik_statistika", component: VlasnikStatistikaComponent },
    { path: "admin_korisnici", component: AdminKorisniciComponent },
    { path: "admin_vikendice", component: AdminVikendiceComponent },
    { path: "admin_korisnici_uredi/:korisnicko_ime", component: AdminKorisniciUrediComponent },
];
