import { Injectable } from '@nestjs/common';
import { AuthGuard } from 'nestjs-keycloak-connect';

@Injectable()
export class KeycloakGuard extends AuthGuard('keycloak') {}
