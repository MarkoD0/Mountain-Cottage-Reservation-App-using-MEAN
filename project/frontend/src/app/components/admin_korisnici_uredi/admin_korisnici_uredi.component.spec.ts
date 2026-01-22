import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminKorisniciUrediComponent } from './admin_korisnici_uredi.component';

describe('AdminKorisniciUrediComponent', () => {
  let component: AdminKorisniciUrediComponent;
  let fixture: ComponentFixture<AdminKorisniciUrediComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminKorisniciUrediComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminKorisniciUrediComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
