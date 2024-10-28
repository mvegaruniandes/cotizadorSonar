import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputMessageErrorComponent } from './input-message-error.component';

describe('InputMessageErrorComponent', () => {
  let component: InputMessageErrorComponent;
  let fixture: ComponentFixture<InputMessageErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputMessageErrorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputMessageErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
