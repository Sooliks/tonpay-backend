import { Body, Controller, Get, Post, Query, Request } from "@nestjs/common";
import { TonService } from './ton.service';

@Controller('ton')
export class TonController {
  constructor(private readonly tonService: TonService) {}
  @Get('transactions')
  findTransactions(@Query('count') count: number, @Request() req, @Query('skip') skip?: number){
    return this.tonService.findTransactions(req.user.id, count, skip);
  }
  @Post('withdraw')
  withdraw(@Request() req, @Body() body: { amount: number, address: string }){
    return this.tonService.sendCoins(body.amount, body.address, req.user.id)
  }

}
