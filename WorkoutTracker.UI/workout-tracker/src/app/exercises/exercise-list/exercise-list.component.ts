import { Component, OnInit } from '@angular/core';
import { ExerciseService } from 'app/exercises/exercise.service';
import { Exercise } from 'app/models/exercise';

@Component({
  selector: 'wt-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent implements OnInit {

    private _exercises: Exercise[];
    constructor(private _exerciseSvc: ExerciseService) { }

    ngOnInit() {
        this.getExercises();
    }

    private getExercises(): void {
        this._exerciseSvc.getAll().subscribe(
            (exercises: Exercise[]) => this._exercises = exercises,
            (error: any) => window.alert("An error occurred getting exercises: " + error)
        );
    }
}
