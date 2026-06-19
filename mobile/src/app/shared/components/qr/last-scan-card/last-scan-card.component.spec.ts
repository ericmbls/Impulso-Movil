import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LastScanCardComponent } from './last-scan-card.component';

describe('LastScanCardComponent', () => {
  let component: LastScanCardComponent;
  let fixture: ComponentFixture<LastScanCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LastScanCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LastScanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
