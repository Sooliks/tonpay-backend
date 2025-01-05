import { IsBoolean } from "class-validator";

export class NotifyToggleDto {
    @IsBoolean()
    value: boolean;
}