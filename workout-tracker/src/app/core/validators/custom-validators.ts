//From https://stackoverflow.com/questions/42038099/validation-on-a-list-of-checkboxes-angular-2
import { AbstractControl, FormControl, FormGroup, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

//TODO: Refactor this file to ditch the class/static methods and just export the validator functions

export class CustomValidators {
  /*
  This validator is an example of cross-field validation.
  For more info: https://angular.io/guide/form-validation#cross-field-validation
  */
  static formGroupOfBooleansRequireOneTrue: ValidatorFn =
    (control: AbstractControl): ValidationErrors | null => {
      let valid = false;

      const formGroup = <UntypedFormGroup>control;

      for (const field in formGroup.controls) {
        const formGroupControl = control.get(field);

        if (formGroupControl?.value) {
          valid = true;
          break;
        }
      }

      return valid ? null : {
        formGroupOfBooleansRequireOneTrue: true
      };
    };

  static startDateTimeVsEndDateTime: ValidatorFn =
    (control: AbstractControl): ValidationErrors | null => {
      let valid = true;

      //TODO: Revisit. Code smell here. Control names must match the ones used here in the validator.
      //More info: https://angular.io/guide/form-validation#cross-field-validation
      const startDateTime = control.get('startDateTime');
      const endDateTime = control.get('endDateTime');

      if (startDateTime && endDateTime) {
        valid = startDateTime.value?.getTime() < endDateTime.value?.getTime();
      }

      return valid ? null : {
        startDateTimeVsEndDateTime: true
      };
    };

  //static compareDatesValidator(startDateControl: FormControl<Date | null>, endDateControl: FormControl<Date | null>, canBeEqual: boolean = false): ValidatorFn {
  static compareDatesValidator(startDateControlName: string, endDateControlName: string, canBeEqual: boolean = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDateControl = control.get(startDateControlName);
      const endDateControl = control.get(endDateControlName);
      let valid: boolean = false;
      
      if (startDateControl?.value && endDateControl?.value) {
        //PrimeNG bug assigns different seconds values...when seconds aren't even part of the displayed component
        const start = new Date(startDateControl.value).setSeconds(0);
        const end = new Date(endDateControl.value).setSeconds(0);

        //console.log('start, end', start, end);

        if (canBeEqual) {
          valid = start <= end;
        } else {
          valid = start < end;
        }
      } 

      //console.log('valid?', valid);

      return valid ? null : {
        compareDates: true
      }
    }
  };

  static passwordsMatch: ValidatorFn =
    (control: AbstractControl): ValidationErrors | null => {
      let valid = true;

      //TODO: Revisit. Code smell here. Control names must match the ones used here in the validator.
      //More info: https://angular.io/guide/form-validation#cross-field-validation
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (password && confirmPassword) {
        valid = (password.value == confirmPassword.value);
      }

      return valid ? null : {
        passwordsMatch: true
      };

    };

}

export function firstControlValueMustBeLessThanOrEqualToSecond(firstControlName: string, secondControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const firstControl = control.get(firstControlName);
    const secondControl = control.get(secondControlName);

    if (firstControl?.value <= secondControl?.value)
      return null;
    else
      return ({ firstControlValueMustBeLessThanOrEqualToSecond: true });
  };
}

export function isRequired(required: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!required) return null;

    if (required && control.value) return null;

    return { isRequired: true };
  };
}