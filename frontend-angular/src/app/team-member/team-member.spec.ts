import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teammember } from './team-member';

describe('Teammember', () => {
  let component: Teammember;
  let fixture: ComponentFixture<Teammember>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teammember]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teammember);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
