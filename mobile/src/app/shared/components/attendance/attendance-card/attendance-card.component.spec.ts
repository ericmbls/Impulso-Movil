import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttendanceCardComponent } from './attendance-card.component';

describe('AttendanceCardComponent', () => {
  let component: AttendanceCardComponent;
  let fixture: ComponentFixture<AttendanceCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AttendanceCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
