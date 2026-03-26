import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './task.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async create(title: string): Promise<Task> {
    const newTask = new this.taskModel({ title });
    return newTask.save();
  }

  async toggle(id: string): Promise<Task | null> {
    const task = await this.taskModel.findById(id);
    if (!task) return null;
    task.completed = !task.completed;
    return task.save();
  }

  async delete(id: string): Promise<void> {
    await this.taskModel.findByIdAndDelete(id);
  }
}