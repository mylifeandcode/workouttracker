import { IPublicEntity } from "app/shared/interfaces/i-public-entity";

export class ExerciseDTO implements IPublicEntity {
    id: number = 0;
    publicId: string | null = null;
    name: string = '';
    targetAreas: string = '';
    description: string = '';
    setup: string = '';
    movements: string = '';
    pointsToRemember: string = '';
}
