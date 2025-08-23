import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarReservation } from './car-reservation';

describe('CarReservation', () => {
  let component: CarReservation;
  let fixture: ComponentFixture<CarReservation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarReservation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarReservation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
