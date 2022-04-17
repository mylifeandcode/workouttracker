//From https://stackoverflow.com/questions/42038099/validation-on-a-list-of-checkboxes-angular-2
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    /*
    This validator is an example of cross-field validation.
    For more info: https://angular.io/guide/form-validation#cross-field-validation
    */
    static formGroupOfBooleansRequireOneTrue: ValidatorFn = 
      (control: AbstractControl): ValidationErrors | null => {
        let valid = false;

        const formGroup = <FormGroup>control;

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

        const startDateTime = control.get('startDateTime');
        const endDateTime = control.get('endDateTime');

        if(startDateTime && endDateTime) {
          valid = startDateTime.value?.getTime() < endDateTime.value?.getTime();
        }

        return valid ? null : {
          startDateTimeVsEndDateTime: true
        }
      }
}
