import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactInfoComponent } from './contact-info.component';

describe('ContactInfoComponent', () => {
  let component: ContactInfoComponent;
  let fixture: ComponentFixture<ContactInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInfoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the contact-info component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose accurate contact details', () => {
    expect(component.phoneNumber).toBe('+221 77 765 56 48');
    expect(component.email).toBe('lawtan@gmail.com');
  });
});
