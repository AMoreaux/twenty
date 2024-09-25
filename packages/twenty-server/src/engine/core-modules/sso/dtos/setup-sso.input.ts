import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUrl, IsOptional } from 'class-validator';

import { IsX509Certificate } from 'src/engine/core-modules/sso/dtos/validators/x509.validator';

@InputType()
class SetupSsoInputCommon {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;
}

@InputType()
export class SetupOIDCSsoInput extends SetupSsoInputCommon {
  @Field(() => String)
  @IsString()
  clientID: string;

  @Field(() => String)
  @IsString()
  clientSecret: string;

  @Field(() => String)
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  issuer: string;
}

@InputType()
export class SetupSAMLSsoInput extends SetupSsoInputCommon {
  @Field(() => String)
  @IsUrl({ protocols: ['http', 'https'] })
  ssoURL: string;

  @Field(() => String)
  @IsX509Certificate()
  certificate: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fingerprint?: string;
}
