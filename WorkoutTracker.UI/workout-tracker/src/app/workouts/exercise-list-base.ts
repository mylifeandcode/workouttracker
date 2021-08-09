import { ExerciseService } from 'app/workouts/exercise.service';
import { PaginatedResults } from '../core/models/paginated-results';
import { finalize, map } from 'rxjs/operators';
import { ExerciseDTO } from 'app/workouts/models/exercise-dto';
import { SelectItem } from 'primeng/api/selectitem';

export abstract class ExerciseListBase {

    //TODO: Clean up this class (specifically the differing access modifiers below)

    public totalRecords: number;
    public loading: boolean = true;
    public pageSize: number = 10;
    public exercises: ExerciseDTO[];
    public targetAreas: SelectItem[] = [];

    constructor(protected _exerciseSvc: ExerciseService) {
        //TODO: Move to ngOnInit()
        this._exerciseSvc
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
            .getAll(first, this.pageSize, nameContains, targetAreaContains)
                .pipe(finalize(() => {
                    setTimeout(() => { this.loading = false; }, 500)
                }))
                .subscribe(
                    (exercises: PaginatedResults<ExerciseDTO>) => {
                        this.exercises = exercises.results;
                        this.totalRecords = exercises.totalCount;
                        console.log("TOTAL: ", exercises.totalCount);
                    },
                    (error: any) => window.alert("An error occurred getting exercises: " + error)
                );
    }
}
