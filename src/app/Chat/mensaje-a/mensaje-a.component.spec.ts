import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajeAComponent } from './mensaje-a.component';

describe('MensajeAComponent', () => {
  let component: MensajeAComponent;
  let fixture: ComponentFixture<MensajeAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajeAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajeAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
