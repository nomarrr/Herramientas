import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrainstormComponent } from './brainstorm.component';

describe('BrainstormComponent', () => {
  let component: BrainstormComponent;
  let fixture: ComponentFixture<BrainstormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrainstormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrainstormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
