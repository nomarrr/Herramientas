import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorizerComponent } from './categorizer.component';

describe('CategorizerComponent', () => {
  let component: CategorizerComponent;
  let fixture: ComponentFixture<CategorizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
