import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { CountryResponseDto } from './dtos/country-response.dto';
import { Public } from '../core/security/decorators/metadata.decorators';
import { SuccessMessage } from '../common/decorators/success-message.decorator';
import { SuccessMessageCode } from '../common/enum/success-message-code.enum';
import { ApiStandardResponse } from '../common/decorators/api-standard-response.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

/** Dados geográficos de referência (países/estados/cidades) — só leitura, público. Alimenta o Step "Endereço" do onboarding. */
@ApiTags('Geografia')
@ApiCommonErrorResponses()
@Controller('v1/geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Public()
  @Get('countries')
  @SuccessMessage(SuccessMessageCode.DATA_RETRIEVED)
  @ApiOperation({ summary: 'Listar países ativos, para o seletor "País" do endereço.' })
  @ApiStandardResponse(CountryResponseDto, { isArray: true })
  async listCountries() {
    return this.geoService.listCountries();
  }
}
