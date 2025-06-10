import { Controller, Get } from '@nestjs/common';
import { Roles } from 'nestjs-keycloak-connect';

@Controller('supplier')
export class SupplierController {
  @Get('dashboard')
  @Roles('supplier')
  getDashboard() {
    return { message: 'Supplier dashboard data' };
  }
}
