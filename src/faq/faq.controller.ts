import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';
import { MarkHelpfulDto } from './dtos/mark-helpful.dto';
import { FaqQueryDto } from './dtos/faq-query.dto';
import { FaqResponseDto } from './dtos/faq-response.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Public } from '../core/security/decorators/metadata.decorators';
import { CurrentUser } from '../core/security/decorators/context.decorators';
import { UserContext } from '../core/security/interfaces/request-context.interface';
import { SuccessMessage } from '../common/decorators/success-message.decorator';
import { SuccessMessageCode } from '../common/enum/success-message-code.enum';
import {
  ApiStandardResponse,
  ApiPaginatedResponse,
} from '../common/decorators/api-standard-response.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Perguntas Frequentes')
@ApiCommonErrorResponses()
@Controller('faq/v1')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @ApiBearerAuth()
  @Post()
  @SuccessMessage(SuccessMessageCode.FAQ_CREATED)
  @ApiOperation({
    summary: 'Criar nova FAQ',
    description: 'Requer autenticação.',
  })
  @ApiStandardResponse(FaqResponseDto, { created: true })
  create(@CurrentUser() user: UserContext, @Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Public()
  @Get()
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({
    summary: 'Listar FAQs ativas, paginadas',
    description: 'Endpoint público.',
  })
  @ApiPaginatedResponse(FaqResponseDto)
  findAll(@Query() query: FaqQueryDto) {
    return this.faqService.findAll(query);
  }

  @Public()
  @Get(':id')
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({
    summary: 'Obter uma FAQ específica',
    description: 'Endpoint público. Incrementa o contador de visualizações.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) da FAQ.' })
  @ApiStandardResponse(FaqResponseDto)
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @SuccessMessage(SuccessMessageCode.FAQ_UPDATED)
  @ApiOperation({
    summary: 'Atualizar uma FAQ',
    description: 'Requer autenticação.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) da FAQ.' })
  @ApiStandardResponse(FaqResponseDto)
  update(
    @CurrentUser() user: UserContext,
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    return this.faqService.update(id, updateFaqDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @SuccessMessage(SuccessMessageCode.FAQ_DELETED)
  @ApiOperation({
    summary: 'Deletar uma FAQ',
    description: 'Requer autenticação.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) da FAQ.' })
  @ApiStandardResponse(FaqResponseDto)
  remove(@CurrentUser() user: UserContext, @Param('id') id: string) {
    return this.faqService.remove(id);
  }

  @Public()
  @Post(':id/helpful')
  @SuccessMessage(SuccessMessageCode.FAQ_FEEDBACK_REGISTERED)
  @ApiOperation({
    summary: 'Marcar FAQ como útil ou não',
    description: 'Endpoint público.',
  })
  @ApiParam({ name: 'id', description: 'ID (UUID) da FAQ.' })
  @ApiStandardResponse(FaqResponseDto)
  markHelpful(@Param('id') id: string, @Body() dto: MarkHelpfulDto) {
    return this.faqService.markHelpful(id, dto.isHelpful);
  }
}
