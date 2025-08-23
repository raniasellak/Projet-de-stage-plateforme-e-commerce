import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationSuccess } from './reservation-success';

describe('ReservationSuccess', () => {
  let component: ReservationSuccess;
  let fixture: ComponentFixture<ReservationSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
