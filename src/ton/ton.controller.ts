import { Controller } from '@nestjs/common';
import { TonService } from './ton.service';

@Controller('ton')
export class TonController {
  constructor(private readonly tonService: TonService) {}
}
