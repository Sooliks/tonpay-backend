import { Controller, Get, Request } from "@nestjs/common";
import { ReferralsService } from './referrals.service';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('my')
  async getMyReferrals(@Request() req) {
    return this.referralsService.getReferrals(req.user.id);
  }

}
