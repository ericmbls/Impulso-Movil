import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickActionCardComponent } from './quick-action-card.component';

describe('QuickActionCardComponent', () => {
  let component: QuickActionCardComponent;
  let fixture: ComponentFixture<QuickActionCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QuickActionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
