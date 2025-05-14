import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenedorChatComponent } from './contenedor-chat.component';

describe('ContenedorChatComponent', () => {
  let component: ContenedorChatComponent;
  let fixture: ComponentFixture<ContenedorChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenedorChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenedorChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
