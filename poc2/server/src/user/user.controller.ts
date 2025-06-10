import { Controller, Get } from '@nestjs/common';
import { Roles } from 'nestjs-keycloak-connect';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.users.findAll();
  }
}
