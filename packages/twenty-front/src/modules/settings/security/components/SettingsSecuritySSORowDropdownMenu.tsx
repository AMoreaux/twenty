import { IconDotsVertical, IconTrash, IconArchive } from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useDeleteSSOIdentityProvider } from '@/settings/security/hooks/useDeleteSSOIdentityProvider';
import { useEditSSOIdentityProvider } from '@/settings/security/hooks/useEditSSOIdentityProvider';
import { isDefined } from '~/utils/isDefined';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { UnwrapRecoilValue } from 'recoil';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import { SsoIdentityProviderStatus } from '~/generated/graphql';

type SettingsSecuritySSORowDropdownMenuProps = {
  SSOIdp: UnwrapRecoilValue<typeof SSOIdentitiesProvidersState>[0];
};

export const SettingsSecuritySSORowDropdownMenu = ({
  SSOIdp,
}: SettingsSecuritySSORowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${SSOIdp.id}`;

  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdown } = useDropdown(dropdownId);

  const { deleteSSOIdentityProvider } = useDeleteSSOIdentityProvider();
  const { editSSOIdentityProvider } = useEditSSOIdentityProvider();

  const handleDeleteSSOIdentityProvider = async (SSOIdpId: string) => {
    const result = await deleteSSOIdentityProvider({ idpId: SSOIdpId });
    if (isDefined(result.errors)) {
      enqueueSnackBar('Error deleting SSO Identity Provider', {
        variant: SnackBarVariant.Error,
        duration: 2000,
      });
    }
  };

  const toggleSSOIdentityProviderStatus = async (SSOIdpId: string) => {
    const result = await editSSOIdentityProvider({
      id: SSOIdpId,
      status:
        SSOIdp.status === 'Active'
          ? SsoIdentityProviderStatus.Inactive
          : SsoIdentityProviderStatus.Active,
    });
    if (isDefined(result.errors)) {
      enqueueSnackBar('Error editing SSO Identity Provider', {
        variant: SnackBarVariant.Error,
        duration: 2000,
      });
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownMenu>
          <DropdownMenuItemsContainer>
            <MenuItem
              accent="default"
              LeftIcon={IconArchive}
              text={SSOIdp.status === 'Active' ? 'Deactivate' : 'Activate'}
              onClick={() => {
                toggleSSOIdentityProviderStatus(SSOIdp.id);
                closeDropdown();
              }}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text="Delete"
              onClick={() => {
                handleDeleteSSOIdentityProvider(SSOIdp.id);
                closeDropdown();
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
    />
  );
};