import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QrCardComponent } from './qr-card.component';

describe('QrCardComponent', () => {
  let component: QrCardComponent;
  let fixture: ComponentFixture<QrCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QrCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
