import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScheduleComponent } from './schedule.component';

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ScheduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
