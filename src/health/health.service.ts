import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async checkDatabaseConnection(): Promise<string> {
    try {
      await this.productRepository.query('SELECT 1');
      return 'Database connection is healthy';
    } catch (error) {
      return 'Database connection failed';
    }
  }
}
