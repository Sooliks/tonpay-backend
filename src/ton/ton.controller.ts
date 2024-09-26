import { Controller, Get, ParseIntPipe, Query, Request } from "@nestjs/common";
import { TonService } from './ton.service';

@Controller('ton')
export class TonController {
  constructor(private readonly tonService: TonService) {}

  @Get('transactions')
  findTransactions(@Query('count') count: number, @Request() req: { id: string }, @Query('skip') skip?: number){
    return this.tonService.findTransactions(req.id, count, skip);
  }

}
