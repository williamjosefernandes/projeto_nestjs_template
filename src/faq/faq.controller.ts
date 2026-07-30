import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfessionalGuard } from '../auth/guards/professional.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Perguntas Frequentes')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @ApiBearerAuth()
  @UseGuards(ProfessionalGuard)
  @Post('v1')
  @ApiOperation({ summary: 'Criar nova FAQ (requer função PROFESSIONAL)' })
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
  @UseGuards(ProfessionalGuard)
  @Patch('v1/:id')
  @ApiOperation({ summary: 'Atualizar uma FAQ (requer função PROFESSIONAL)' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  @ApiBearerAuth()
  @UseGuards(ProfessionalGuard)
  @Delete('v1/:id')
  @ApiOperation({ summary: 'Deletar uma FAQ (requer função PROFESSIONAL)' })
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