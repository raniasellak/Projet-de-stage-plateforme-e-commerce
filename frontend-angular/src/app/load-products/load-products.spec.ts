import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadProducts } from './load-products';

describe('LoadProducts', () => {
  let component: LoadProducts;
  let fixture: ComponentFixture<LoadProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
