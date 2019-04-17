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

    //TODO: Clean up this class (specifically the differing access modifiers below)

    public _totalRecords: number;
    public loading: boolean = true;
    public _pageSize: number = 10;
    private _exercises: Exercise[];
    public cols: any = [
        { field: 'name', header: 'Name' }, 
        { field: 'description', header: 'Description' }
    ]; //TODO: Create specific type

    constructor(private _exerciseSvc: ExerciseService) { }

    public getExercises(first: number, nameContains: string, descriptionContains: string): void {
        this.loading = true;
        this._exerciseSvc
            .getAll(first, this._pageSize, nameContains)
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
        let nameContains: string = null;
        let descriptionContains: string = null;

        if (event.filters["name"])
            nameContains = event.filters["name"].value;

        if (event.filters["description"])
            descriptionContains = event.filters["description"].value;

        this.getExercises(event.first, nameContains, descriptionContains);
    }
}
