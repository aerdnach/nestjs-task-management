import { BadRequestException, PipeTransform } from "@nestjs/common";
import { TaskStatus } from "../task-status.enum";

export class TaskStatusValidatioPipe implements PipeTransform {
    readonly allowedStatuses = [
        TaskStatus.OPEN,
        TaskStatus.IN_RPOGRESS,
        TaskStatus.DONE
    ]

    private isStatusValid(status: any) {
        const idx = this.allowedStatuses.indexOf(status)
        return idx !== -1
    }

    transform(value: any) {
        value = value.toUpperCase()
                
        if(!this.isStatusValid(value)) {
            throw new BadRequestException(value + ' is an invalid status');
        }

        return value
    }
}