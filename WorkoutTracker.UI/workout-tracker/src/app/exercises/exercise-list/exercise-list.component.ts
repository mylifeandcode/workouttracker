import { Component } from '@angular/core';
import { ExerciseService } from 'app/exercises/exercise.service';
import { PaginatedResults } from 'app/models/paginated-results';
import { finalize, map } from 'rxjs/operators';
import { ExerciseDTO } from 'app/models/exercise-dto';
import { TargetArea } from 'app/models/target-area';
import { SelectItem } from 'primeng/components/common/selectitem';

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
    private _exercises: ExerciseDTO[];
    public cols: any = [
        { field: 'name', header: 'Name' }, 
        { field: 'targetAreas', header: 'Target Areas' }
    ]; //TODO: Create specific type
    public targetAreas: SelectItem[] = [];

    constructor(private _exerciseSvc: ExerciseService) { 
        _exerciseSvc
            .getTargetAreas()
            .pipe(map(targetAreas => targetAreas.map(targetArea => targetArea.name)))
            .subscribe((targetAreaNames: string[]) => { 
                targetAreaNames.forEach(element => {
                    this.targetAreas.push({label: element, value: element});
                });
            },
            (error: any) => window.alert("An error occurred getting exercises: " + error)
        );
    }

    public getExercises(first: number, nameContains: string, targetAreaContains: string): void {
        this.loading = true;
        this._exerciseSvc
            .getAll(first, this._pageSize, nameContains, targetAreaContains)
                .pipe(finalize(() => { 
                    setTimeout(() => { this.loading = false; }, 500)
                }))
                .subscribe(
                    (exercises: PaginatedResults<ExerciseDTO>) => { 
                        this._exercises = exercises.results;
                        this._totalRecords = exercises.totalCount;
                    },
                    (error: any) => window.alert("An error occurred getting exercises: " + error)
                );
    }

    public getExercisesLazy(event: any): void {
        let nameContains: string;
        let targetAreaContains: string;

        if (event.filters["name"])
            nameContains = event.filters["name"].value;

        if (event.filters["targetAreas"])
            targetAreaContains = event.filters["targetAreas"].value;

        this.getExercises(event.first, nameContains, targetAreaContains);
    }
}
