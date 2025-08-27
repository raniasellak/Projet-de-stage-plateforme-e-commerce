import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCancel } from './payment-cancel';

describe('PaymentCancel', () => {
  let component: PaymentCancel;
  let fixture: ComponentFixture<PaymentCancel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCancel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentCancel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
