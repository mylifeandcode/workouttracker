import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ExerciseService } from '../exercise.service';
import { Exercise } from '../exercise';
import { TargetArea } from '../target-area';

@Component({
  selector: 'wt-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.css']
})
export class ExerciseEditComponent implements OnInit {

    constructor(private route: ActivatedRoute, private _formBuilder: FormBuilder, private _exerciseSvc: ExerciseService) {
        this.createForm();
    }

    public targetAreas: Array<TargetArea> = [];

    exercise: Exercise;
    exerciseForm: FormGroup;

    ngOnInit() {
        //this._exerciseSvc.getTargetAreas().subscribe((resp) => this.targetAreas = resp);
        this.setupViewModel();
    }

    setupViewModel() {
        //TODO: Merge available target areas with selected target areas
        this.targetAreas.push(new TargetArea(1, "Chest", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(1, "Biceps", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(1, "Triceps", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(1, "Shoulders", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(1, "Core", null, null, null, null, false));
        this.targetAreas.push(new TargetArea(1, "Legs", null, null, null, null, false));
    }

    createForm() {
        this.exerciseForm = this._formBuilder.group({
            id: [0, Validators.required ], //TODO: Get ID from URL
            name: [ '', Validators.required ], 
            description: ['', Validators.required], 
            targetAreas: this.buildTargetAreas()
        });

        

        let checkboxes = new Array<FormControl>(this.targetAreas.length);
        //this.exercise.targetAreas.forEach(element => {
          //  checkboxes.push(new FormControl()
        //});

        //let checkboxArray = new FormArray()
    }

    buildTargetAreas() : FormArray {
        //Great approach I found at:
        //https://netbasal.com/handling-multiple-checkboxes-in-angular-forms-57eb8e846d21
        const arr = this.targetAreas.map(area => {
            return this._formBuilder.control(area.selected);
        });
        return this._formBuilder.array(arr);
    }

    get allTargetAreas() {
        return this.exerciseForm.get('targetAreas');
    };
}
