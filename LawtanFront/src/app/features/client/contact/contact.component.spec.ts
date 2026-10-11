import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the contact component', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form if required fields are missing', () => {
    expect(component.contactForm.valid).toBeFalse();
    component.onSubmit();
    expect(component.isSubmitted()).toBeFalse();
  });

  it('should validate form when required fields are provided', () => {
    component.contactForm.patchValue({
      fullName: 'Ibrahima Diallo',
      phone: '+221 77 123 45 67',
      email: 'ibrahima@example.com',
      locality: 'Saint-Louis',
      subject: 'Demande d\'information',
      message: 'Bonjour, je souhaite avoir plus d\'informations.',
      termsAccepted: true
    });

    expect(component.contactForm.valid).toBeTrue();
  });
});
