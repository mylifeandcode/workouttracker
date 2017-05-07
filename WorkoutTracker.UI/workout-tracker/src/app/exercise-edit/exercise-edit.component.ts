import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
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

    public targetAreas: Array<TargetArea>;

    exercise: Exercise;
    exerciseForm: FormGroup;

    ngOnInit() {
        //this._exerciseSvc.getTargetAreas().subscribe((resp) => this.targetAreas = resp);
        this.setupViewModel();
    }

    setupViewModel() {
    }

    createForm() {
        this.exerciseForm = this._formBuilder.group({
            id: [0, Validators.required ], //TODO: Get ID from URL
            name: [ '', Validators.required ], 
            description: ['', Validators.required]
        });
    }

}
