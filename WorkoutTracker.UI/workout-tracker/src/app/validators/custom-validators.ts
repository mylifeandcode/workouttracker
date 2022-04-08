//From https://stackoverflow.com/questions/42038099/validation-on-a-list-of-checkboxes-angular-2
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    static multipleCheckboxRequireOne(fa: FormArray) {
        let valid = false;

        for (let x = 0; x < fa.length; ++x) {
            if (fa.at(x).value) {
                valid = true;
                break;
            }
        }

        return valid ? null : {
            multipleCheckboxRequireOne: true
        };
    }

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
}
