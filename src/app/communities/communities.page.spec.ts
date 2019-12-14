import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CommunitiesPage } from './communities.page';

describe('CommunitiesPage', () => {
  let component: CommunitiesPage;
  let fixture: ComponentFixture<CommunitiesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunitiesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunitiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
