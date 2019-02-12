import { Component, OnInit } from '@angular/core';
import { ExerciseService } from 'app/exercises/exercise.service';
import { Exercise } from 'app/models/exercise';
import { PaginatedResults } from 'app/models/paginated-results';

@Component({
  selector: 'wt-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent implements OnInit {

    public _totalRecords: number;
    public _loading: boolean = false;
    public _pageSize: number = 10;
    private _exercises: Exercise[];
    constructor(private _exerciseSvc: ExerciseService) { }

    ngOnInit() {
        //this.getExercises(0);
    }

    public getExercises(first: number): void {
        this._loading = true;
        this._exerciseSvc.getAll(first, this._pageSize).subscribe(
            (exercises: PaginatedResults<Exercise>) => { 
                this._exercises = exercises.results;
                this._totalRecords = exercises.totalCount;
            },
            (error: any) => window.alert("An error occurred getting exercises: " + error), 
            () => this._loading = false
        );
    }

    public getExercisesLazy(event: any): void {
        //TODO: Replace "any" type with concrete type
        this.getExercises(event.first);
    }
}
