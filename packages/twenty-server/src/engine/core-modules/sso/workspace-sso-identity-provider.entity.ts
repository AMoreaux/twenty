import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export enum IdpType {
  OIDC = 'OIDC',
  SAML = 'SAML',
}

export enum OIDCResponseType {
  // Only Authorization Code is used for now
  CODE = 'code',
  ID_TOKEN = 'id_token',
  TOKEN = 'token',
  NONE = 'none',
}

registerEnumType(IdpType, {
  name: 'IdpType',
});

export enum SSOIdentityProviderStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Error = 'Error',
}

registerEnumType(SSOIdentityProviderStatus, {
  name: 'SSOIdentityProviderStatus',
});

@Entity({ name: 'workspaceSSOIdentityProvider', schema: 'core' })
@ObjectType('WorkspaceSSOIdentityProvider')
export class WorkspaceSSOIdentityProvider {
  // COMMON
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({
    type: 'enum',
    enum: SSOIdentityProviderStatus,
    default: SSOIdentityProviderStatus.Active,
  })
  status: SSOIdentityProviderStatus;

  @ManyToOne(
    () => Workspace,
    (workspace) => workspace.workspaceSSOIdentityProviders,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Column()
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: IdpType,
    default: IdpType.OIDC,
  })
  type: IdpType;

  @Column()
  issuer: string;

  // OIDC
  @Column({ nullable: true })
  clientID?: string;

  @Column({ nullable: true })
  clientSecret?: string;

  // SAML
  @Column({ nullable: true })
  ssoURL?: string;

  @Column({ nullable: true })
  certificate?: string;

  @Column({ nullable: true })
  fingerprint?: string;
}