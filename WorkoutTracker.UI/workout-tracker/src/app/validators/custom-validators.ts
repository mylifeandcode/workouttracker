//From https://stackoverflow.com/questions/42038099/validation-on-a-list-of-checkboxes-angular-2
import { FormArray, FormGroup } from '@angular/forms';

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

    static formGroupOfBooleansRequireOneTrue(formGroup: FormGroup) {
        let valid = false;
        
        for (const field in formGroup.controls) {
            const control = formGroup.get(field);
            console.log("FIELD: ", field);
            if(control.value) {
                valid = true;
                console.log("YO");
                break;
            }
        }

        return valid ? null : {
            formGroupOfBooleansRequireOneTrue: true
        };        
     
    }
}