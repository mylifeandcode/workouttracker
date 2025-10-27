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
    toErrorMessages(this.errors(), this.showFieldNames())
  );
}

function toErrorMessages(
  errors: ValidationError[],
  showFieldNames: boolean
): string[] {
  return errors.map((error) => {
    const prefix = showFieldNames ? toFieldName(error) + ': ' : '';
    // const prefix = showFieldNames ? error.field().name() + ': ' : '';

    const message = error.message ?? toMessage(error);
    return prefix + message;
  });
}

function toFieldName(error: ValidationError) {
  return error.field().name().split('.').at(-1);
}

function toMessage(error: ValidationError): string {
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
