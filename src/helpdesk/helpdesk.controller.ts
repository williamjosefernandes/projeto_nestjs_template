import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { HelpdeskService } from './helpdesk.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateTicketStatusDto } from './dtos/update-ticket-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Suporte')
@ApiBearerAuth()
@Controller('helpdesk/tickets')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @UseGuards(JwtAuthGuard)
  @Post('v1')
  @ApiOperation({ summary: 'Criar novo ticket' })
  createTicket(@CurrentUser() user: any, @Body() createTicketDto: CreateTicketDto) {
    return this.helpdeskService.createTicket(user.id, createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('v1')
  @ApiOperation({ summary: 'Obter todos os tickets do usuário' })
  getTickets(@CurrentUser() user: any) {
    return this.helpdeskService.getTickets(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('v1/:id')
  @ApiOperation({ summary: 'Obter um ticket específico' })
  getTicket(@CurrentUser() user: any, @Param('id') id: string) {
    return this.helpdeskService.getTicket(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('v1/:id/messages')
  @ApiOperation({ summary: 'Adicionar mensagem a um ticket' })
  addMessage(@CurrentUser() user: any, @Param('id') id: string, @Body() createMessageDto: CreateMessageDto) {
    return this.helpdeskService.addMessage(user.id, id, createMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('v1/:id/status')
  @ApiOperation({ summary: 'Atualizar status do ticket' })
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.helpdeskService.updateStatus(user.id, id, dto);
  }
}