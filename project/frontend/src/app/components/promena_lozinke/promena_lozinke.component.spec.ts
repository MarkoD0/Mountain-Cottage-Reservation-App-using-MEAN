import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Promena_lozinkeComponent } from './promena_lozinke.component';

describe('Promena_lozinkeComponent', () => {
  let component: Promena_lozinkeComponent;
  let fixture: ComponentFixture<Promena_lozinkeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Promena_lozinkeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Promena_lozinkeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
