import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFaqDto) {
    return this.prisma.fAQ.create({ data });
  }

  async findAll() {
    return this.prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const faq = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    
    // increment views
    return this.prisma.fAQ.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
  }

  async update(id: string, data: UpdateFaqDto) {
    return this.prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.fAQ.delete({
      where: { id },
    });
  }

  async markHelpful(id: string, isHelpful: boolean) {
    const faq = await this.findOne(id);
    if (isHelpful) {
      return this.prisma.fAQ.update({
        where: { id },
        data: { helpful: { increment: 1 } },
      });
    } else {
      return this.prisma.fAQ.update({
        where: { id },
        data: { notHelpful: { increment: 1 } },
      });
    }
  }
}