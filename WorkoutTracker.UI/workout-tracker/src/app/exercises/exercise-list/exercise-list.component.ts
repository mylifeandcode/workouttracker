import { Component } from '@angular/core';
import { ExerciseService } from 'app/exercises/exercise.service';
import { Exercise } from 'app/models/exercise';
import { PaginatedResults } from 'app/models/paginated-results';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'wt-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent {

    //There is no ngOnInit or ngAfterViewInit here because the onLazyLoad() event of the PrimeNg
    //Turbo Table automatically makes a call to get data on initialization

    public _totalRecords: number;
    public loading: boolean = true;
    public _pageSize: number = 10;
    private _exercises: Exercise[];

    constructor(private _exerciseSvc: ExerciseService) { }

    public getExercises(first: number): void {
        this.loading = true;
        this._exerciseSvc
            .getAll(first, this._pageSize)
                .pipe(finalize(() => { 
                    setTimeout(() => { this.loading = false; }, 500)
                }))
                .subscribe(
                    (exercises: PaginatedResults<Exercise>) => { 
                        this._exercises = exercises.results;
                        this._totalRecords = exercises.totalCount;
                    },
                    (error: any) => window.alert("An error occurred getting exercises: " + error)
                );
    }

    public getExercisesLazy(event: any): void {
        //TODO: Replace "any" type with concrete type
        this.getExercises(event.first);
    }
}
