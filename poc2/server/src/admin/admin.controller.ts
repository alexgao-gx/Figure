import { Controller, Get } from '@nestjs/common';
import { Roles } from 'nestjs-keycloak-connect';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @Roles('admin')
  getDashboard() {
    return { message: 'Admin dashboard data' };
  }
}
