import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';
import { FaqQueryDto } from './dtos/faq-query.dto';
import { ErrorCode } from '../common/enum/error-code.enum';
import { NotFoundAppException } from '../common/exceptions/app.exception';
import { PageMetaDto } from '../common/pagination/pagination-info-response.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFaqDto) {
    return this.prisma.fAQ.create({ data });
  }

  async findAll(query: FaqQueryDto) {
    const { page, size } = query;
    const where = { isActive: true };

    const [totalElements, content] = await Promise.all([
      this.prisma.fAQ.count({ where }),
      this.prisma.fAQ.findMany({
        where,
        orderBy: { order: 'asc' },
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    return { ...PageMetaDto.create({ page, size, totalElements }), content };
  }

  /** Busca uma FAQ e registra a visualização — único ponto que incrementa `views`. */
  async findOne(id: string) {
    await this.ensureExists(id);
    return this.prisma.fAQ.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async update(id: string, data: UpdateFaqDto) {
    await this.ensureExists(id);
    return this.prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.fAQ.delete({
      where: { id },
    });
  }

  async markHelpful(id: string, isHelpful: boolean) {
    await this.ensureExists(id);
    return this.prisma.fAQ.update({
      where: { id },
      data: isHelpful
        ? { helpful: { increment: 1 } }
        : { notHelpful: { increment: 1 } },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!faq) throw new NotFoundAppException(ErrorCode.FAQ_NOT_FOUND);
  }
}
