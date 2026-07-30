import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateTicketStatusDto } from './dtos/update-ticket-status.dto';
import { SenderType, TicketStatus } from '@prisma/client';

@Injectable()
export class HelpdeskService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, data: CreateTicketDto) {
    return this.prisma.ticketHelpdesk.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async getTickets(userId: string) {
    return this.prisma.ticketHelpdesk.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicket(userId: string, id: string) {
    const ticket = await this.prisma.ticketHelpdesk.findFirst({
      where: { id, userId },
      include: { messages: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async addMessage(userId: string, id: string, data: CreateMessageDto) {
    const ticket = await this.getTicket(userId, id);
    return this.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        userId,
        senderType: SenderType.user,
        content: data.content,
      },
    });
  }

  async updateStatus(userId: string, id: string, data: UpdateTicketStatusDto) {
    const ticket = await this.getTicket(userId, id);
    return this.prisma.ticketHelpdesk.update({
      where: { id: ticket.id },
      data: {
        status: data.status,
        resolvedAt: data.status === TicketStatus.RESOLVED || data.status === TicketStatus.CLOSED ? new Date() : null,
      },
    });
  }
}