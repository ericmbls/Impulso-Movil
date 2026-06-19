import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScanFrameComponent } from './scan-frame.component';

describe('ScanFrameComponent', () => {
  let component: ScanFrameComponent;
  let fixture: ComponentFixture<ScanFrameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ScanFrameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
