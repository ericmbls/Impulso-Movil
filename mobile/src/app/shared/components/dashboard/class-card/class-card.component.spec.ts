import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClassCardComponent } from './class-card.component';

describe('ClassCardComponent', () => {
  let component: ClassCardComponent;
  let fixture: ComponentFixture<ClassCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ClassCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
