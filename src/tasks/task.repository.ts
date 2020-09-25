import { InternalServerErrorException, Logger } from "@nestjs/common";
import { User } from "src/auth/user.entity";
import { EntityRepository, Repository } from "typeorm";
import { CreateTaskDto } from "./dto/create-task.dto";
import { GetTaskFilterDto } from "./dto/get-task-filter.dto";
import { TaskStatus } from "./task-status.enum";
import { Task } from "./task.entity";

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    
    private logger = new Logger('TaskRepository')

    async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
        const { status, search} = filterDto
        const query = this.createQueryBuilder('task')

        query.where('task."userId" = :userId', { userId: user.id})

        if (status) {
            query.andWhere('task.status = :status', { status })
        }

        if (search) {
            query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search })
        }

        try {
            const tasks = await query.getMany()
            return tasks
        } catch (error) {
            this.logger.error(`Faileg to get task for user "${user.username}", DTO: "${filterDto}"`, error.stack)
            throw new InternalServerErrorException()
        }
    }

    async createTask(
        createTaskDto: CreateTaskDto,
        user: User
    ): Promise<Task> {
        const task = new Task()
        const {title, description} = createTaskDto
        task.title = title
        task.description = description
        task.status = TaskStatus.OPEN
        task.user = user
        try {
            await task.save()
        } catch (error) {
            this.logger.error(`Failed to create task for user "${user.username}", DTO: "${createTaskDto}"`, error.stack)
            throw new InternalServerErrorException()
        }

        delete task.user

        return task
    } 
}