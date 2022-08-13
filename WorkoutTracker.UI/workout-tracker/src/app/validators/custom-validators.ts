//From https://stackoverflow.com/questions/42038099/validation-on-a-list-of-checkboxes-angular-2
import { AbstractControl, FormArray, FormControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

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

            if(formGroupControl?.value) {
                valid = true;
                break;
            }
        }

        return valid ? null : {
            formGroupOfBooleansRequireOneTrue: true
        };
      }

    static startDateTimeVsEndDateTime: ValidatorFn = 
      (control: AbstractControl): ValidationErrors | null => {
        let valid = true;

        //TODO: Revisit. Code smell here. Control names must match the ones used here in the validator.
        const startDateTime = control.get('startDateTime');
        const endDateTime = control.get('endDateTime');

        if(startDateTime && endDateTime) {
          valid = startDateTime.value?.getTime() < endDateTime.value?.getTime();
        }

        return valid ? null : {
          startDateTimeVsEndDateTime: true
        }
      }

    static passwordsMatch: ValidatorFn = 
      (control: AbstractControl): ValidationErrors | null => {
        let valid = true;

        //TODO: Revisit. Code smell here. Control names must match the ones used here in the validator.
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');
        
        if(password && confirmPassword) {
          valid = (password.value == confirmPassword.value);
        }

        return valid ? null : {
          passwordsMatch: true
        }

      }
}
