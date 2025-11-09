//Hat-tip to Angular Architects, which is where I "borrowed" this component from
import { Component, computed, input } from '@angular/core';
import { MaxValidationError, MinValidationError, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'wt-validation-errors',
  imports: [],
  templateUrl: './validation-errors.component.html',
  styleUrl: './validation-errors.component.scss',
})
export class ValidationErrorsComponent {
  errors = input.required<ValidationError[]>();
  showFieldNames = input(false);

  errorMessages = computed(() =>
    this.toErrorMessages(this.errors(), this.showFieldNames())
  );

  private toErrorMessages(
    errors: ValidationError[],
    showFieldNames: boolean
  ): string[] {
    return errors.map((error) => {
      const prefix = showFieldNames ? this.toFieldName(error) + ': ' : '';
      const message = error.message ?? this.toMessage(error);
      console.log('Validation error message:', prefix + message);
      return prefix + message;
    });
  }

  private toFieldName(error: ValidationError): string | undefined {
    return error.message;
  }

  private toMessage(error: ValidationError): string {
    switch (error.kind) {
      case 'required':
        return 'Required';
      case 'min':
        const minError = error as MinValidationError;
        return `Minimum length: ${minError.min}`;
      case 'max':
        const maxError = error as MaxValidationError;
        return `Maximum length: ${maxError.max}`;
      default:
        return error.kind ?? 'Validation Error';
    }
  }
}
