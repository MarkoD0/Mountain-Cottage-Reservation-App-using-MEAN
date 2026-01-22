import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminKorisniciComponent } from './admin_korisnici.component';

describe('AdminKorisniciComponent', () => {
  let component: AdminKorisniciComponent;
  let fixture: ComponentFixture<AdminKorisniciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminKorisniciComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminKorisniciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
