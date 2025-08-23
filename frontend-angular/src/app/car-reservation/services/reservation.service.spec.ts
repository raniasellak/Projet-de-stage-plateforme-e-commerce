import { TestBed } from '@angular/core/testing';

import { ReservationServiceTs } from './reservation.service.ts';

describe('ReservationServiceTs', () => {
  let service: ReservationServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
