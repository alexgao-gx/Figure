import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakConnectModule } from 'nestjs-keycloak-connect';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'demo',
      password: 'demo',
      database: 'demo',
      autoLoadEntities: true,
      synchronize: true,
    }),
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080/auth',
      realm: 'demo',
      clientId: 'nest-app',
      secret: 'change-me',
    }),
    UserModule,
    AdminModule,
    SupplierModule,
  ],
})
export class AppModule {}
