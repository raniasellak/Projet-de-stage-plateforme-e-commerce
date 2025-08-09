import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadClients } from './load-clients';

describe('LoadClients', () => {
  let component: LoadClients;
  let fixture: ComponentFixture<LoadClients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadClients]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadClients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
