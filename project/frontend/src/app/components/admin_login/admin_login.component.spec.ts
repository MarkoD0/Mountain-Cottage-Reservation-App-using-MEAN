import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admin_loginComponent } from './admin_login.component';

describe('Admin_loginComponent', () => {
  let component: Admin_loginComponent;
  let fixture: ComponentFixture<Admin_loginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin_loginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Admin_loginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
