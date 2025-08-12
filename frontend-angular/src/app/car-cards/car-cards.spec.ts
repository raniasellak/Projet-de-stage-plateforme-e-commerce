import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarCards } from './car-cards';

describe('CarCards', () => {
  let component: CarCards;
  let fixture: ComponentFixture<CarCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
