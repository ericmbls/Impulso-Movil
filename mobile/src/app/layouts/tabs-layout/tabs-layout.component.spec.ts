import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabsLayoutComponent } from './tabs-layout.component';

describe('TabsLayoutComponent', () => {
  let component: TabsLayoutComponent;
  let fixture: ComponentFixture<TabsLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TabsLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
