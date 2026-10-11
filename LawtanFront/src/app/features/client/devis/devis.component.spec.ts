import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DevisComponent } from './devis.component';

describe('DevisComponent', () => {
  let component: DevisComponent;
  let fixture: ComponentFixture<DevisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevisComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DevisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the devis page component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch category between prestation and laitier', () => {
    expect(component.devisCategory()).toBe('prestation');

    component.setCategory('laitier');
    expect(component.devisCategory()).toBe('laitier');

    component.setCategory('prestation');
    expect(component.devisCategory()).toBe('prestation');
  });

  it('should invalidate form if required fields are missing', () => {
    expect(component.devisForm.valid).toBeFalse();
    component.onSubmit();
    expect(component.isSubmitted()).toBeFalse();
  });
});
