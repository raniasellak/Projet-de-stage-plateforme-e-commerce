import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadPayments } from './load-payments';

describe('LoadPayments', () => {
  let component: LoadPayments;
  let fixture: ComponentFixture<LoadPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadPayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadPayments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
