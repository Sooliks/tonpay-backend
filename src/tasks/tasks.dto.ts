import { IsNumber } from "class-validator";

export class CheckCompleteTaskDto {
    @IsNumber()
    idTask: number;
}