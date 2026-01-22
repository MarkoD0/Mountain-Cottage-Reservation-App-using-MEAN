import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetaljiVikendiceComponent } from './detalji-vikendice.component';

describe('DetaljiVikendiceComponent', () => {
  let component: DetaljiVikendiceComponent;
  let fixture: ComponentFixture<DetaljiVikendiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetaljiVikendiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetaljiVikendiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
