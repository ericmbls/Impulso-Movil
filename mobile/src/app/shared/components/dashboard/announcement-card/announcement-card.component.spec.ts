import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnouncementCardComponent } from './announcement-card.component';

describe('AnnouncementCardComponent', () => {
  let component: AnnouncementCardComponent;
  let fixture: ComponentFixture<AnnouncementCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AnnouncementCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
