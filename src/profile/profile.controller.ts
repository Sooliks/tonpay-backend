import { Controller, Get, Param } from "@nestjs/common";
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string){
    return this.profileService.getUserById(id)
  }
}
