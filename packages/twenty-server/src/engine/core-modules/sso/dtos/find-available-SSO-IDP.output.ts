import { Field, ObjectType } from '@nestjs/graphql';

import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import {
  IdpType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@ObjectType()
class WorkspaceNameAndId {
  @Field(() => String)
  displayName: string;

  @Field(() => String)
  id: string;
}

@ObjectType()
export class FindAvailableSSOIDPOutput {
  @Field(() => IdpType)
  type: SSOConfiguration['type'];

  @Field(() => String)
  id: string;

  @Field(() => String)
  issuer: string;

  @Field(() => String)
  name: string;

  @Field(() => SSOIdentityProviderStatus)
  status: SSOConfiguration['status'];

  @Field(() => WorkspaceNameAndId)
  workspace: WorkspaceNameAndId;
}