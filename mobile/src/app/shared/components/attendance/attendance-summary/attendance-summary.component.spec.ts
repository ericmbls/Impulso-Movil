import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttendanceSummaryComponent } from './attendance-summary.component';

describe('AttendanceSummaryComponent', () => {
  let component: AttendanceSummaryComponent;
  let fixture: ComponentFixture<AttendanceSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AttendanceSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
