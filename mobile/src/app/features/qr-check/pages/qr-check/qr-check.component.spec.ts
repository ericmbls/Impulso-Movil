import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QrCheckComponent } from './qr-check.component';

describe('QrCheckComponent', () => {
  let component: QrCheckComponent;
  let fixture: ComponentFixture<QrCheckComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QrCheckComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
