import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { GoogleOauthGuard } from 'src/engine/core-modules/auth/guards/google-oauth.guard';
import { GoogleProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/google-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { GoogleRequest } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { computeRedirectErrorUrl } from 'src/engine/core-modules/auth/utils/compute-redirect-error-url';

@Controller('auth/google')
@UseFilters(AuthRestApiExceptionFilter)
export class GoogleAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  @UseFilters(AuthOAuthExceptionFilter)
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        picture,
        workspaceInviteHash,
        workspacePersonalInviteToken,
        targetWorkspaceSubdomain,
      } = req.user;

      const user = await this.authService.signInUp({
        email,
        firstName,
        lastName,
        picture,
        workspaceInviteHash,
        workspacePersonalInviteToken,
        targetWorkspaceSubdomain,
        fromSSO: true,
      });

      if (!user.defaultWorkspace.isGoogleAuthEnabled) {
        throw new AuthException(
          'Google auth is not enabled for this workspace',
          AuthExceptionCode.OAUTH_ACCESS_DENIED,
        );
      }

      const loginToken = await this.loginTokenService.generateLoginToken(
        user.email,
      );

      return res.redirect(
        await this.authService.computeRedirectURI(
          loginToken.token,
          user.defaultWorkspace.subdomain,
        ),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          computeRedirectErrorUrl({
            frontBaseUrl: this.environmentService.get('FRONT_BASE_URL'),
            errorMessage: err.message,
          }),
        );
      }
      throw err;
    }
  }
}
