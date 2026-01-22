import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlasnikStatistikaComponent } from './vlasnik_statistika.component';

describe('VlasnikStatistikaComponent', () => {
  let component: VlasnikStatistikaComponent;
  let fixture: ComponentFixture<VlasnikStatistikaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlasnikStatistikaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlasnikStatistikaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
