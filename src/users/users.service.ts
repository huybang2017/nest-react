import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Account } from 'src/account/account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  // Create a new user
  async createUser(
    username: string,
    email: string,
    phoneNumber: string,
    accountId: number,
  ): Promise<User> {
    const account = await this.accountsRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const newUser = this.usersRepository.create({
      username,
      email,
      phoneNumber,
      account,
    });
    return this.usersRepository.save(newUser);
  }

  // Get all users
  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['account'] }); // Include account details in the result
  }

  // Get user by ID
  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['account'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Update a user by ID
  async updateUser(
    id: number,
    username: string,
    email: string,
    phoneNumber: string,
    accountId: number,
  ): Promise<User> {
    const user = await this.findUserById(id);

    if (username) user.username = username;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    if (accountId) {
      const account = await this.accountsRepository.findOne({
        where: { id: accountId },
      });
      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }
      user.account = account;
    }

    return this.usersRepository.save(user);
  }

  // Delete a user by ID
  async deleteUser(id: number): Promise<void> {
    const user = await this.findUserById(id);
    await this.usersRepository.remove(user);
  }
}
