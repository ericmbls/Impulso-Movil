import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GradesComponent } from './grades.component';

describe('GradesComponent', () => {
  let component: GradesComponent;
  let fixture: ComponentFixture<GradesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GradesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
