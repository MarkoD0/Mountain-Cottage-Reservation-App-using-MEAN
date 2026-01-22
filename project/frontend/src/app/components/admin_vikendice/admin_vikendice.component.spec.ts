import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVikendiceComponent } from './admin_vikendice.component';

describe('AdminVikendiceComponent', () => {
  let component: AdminVikendiceComponent;
  let fixture: ComponentFixture<AdminVikendiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVikendiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminVikendiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
