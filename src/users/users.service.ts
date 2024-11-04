import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find().then((users: any) => {
      return users;
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(user: User): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already in use');
    }
    return this.usersRepository.save(user);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const duplicateUser = await this.usersRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });
    if (duplicateUser && duplicateUser.id !== id) {
      throw new ConflictException('Username or email already in use');
    }
    // Update the user with new data
    await this.usersRepository.update(id, user);
    return this.usersRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
