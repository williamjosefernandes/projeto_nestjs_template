import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';
import { JwtAuthGuard } from '../core/security/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../core/security/decorators/metadata.decorators';
import { CurrentUser } from '../core/security/decorators/context.decorators';

@ApiTags('Perguntas Frequentes')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('v1')
  @ApiOperation({ summary: 'Criar nova FAQ' })
  create(@CurrentUser() user: any, @Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Public()
  @Get('v1')
  @ApiOperation({ summary: 'Listar todas as FAQs ativas' })
  findAll() {
    return this.faqService.findAll();
  }

  @Public()
  @Get('v1/:id')
  @ApiOperation({ summary: 'Obter uma FAQ específica' })
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('v1/:id')
  @ApiOperation({ summary: 'Atualizar uma FAQ' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('v1/:id')
  @ApiOperation({ summary: 'Deletar uma FAQ' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.faqService.remove(id);
  }

  @Public()
  @Post('v1/:id/helpful')
  @ApiOperation({ summary: 'Marcar FAQ como útil ou não' })
  markHelpful(@Param('id') id: string, @Body('isHelpful') isHelpful: boolean) {
    return this.faqService.markHelpful(id, isHelpful);
  }
}