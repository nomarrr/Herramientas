import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajeBComponent } from './mensaje-b.component';

describe('MensajeBComponent', () => {
  let component: MensajeBComponent;
  let fixture: ComponentFixture<MensajeBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajeBComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajeBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
