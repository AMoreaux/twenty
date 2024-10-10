import React, { ChangeEvent, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Section } from '@/ui/layout/section/components/Section';
import { H2Title, IconCopy, IconUpload } from 'twenty-ui';
import styled from '@emotion/styled';
import { TextInput } from '@/ui/input/components/TextInput';
import { Button } from '@/ui/input/button/components/Button';
import { isDefined } from '~/utils/isDefined';
import { parseSAMLMetadata } from '@/settings/security/utils/parseXMLMetadata';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';

const StyledUploadFileContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonCopy = styled.div`
  align-items: end;
  display: flex;
`;

export const SettingsSSOSAMLForm = () => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const { setValue, getValues } = useFormContext();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) {
      const text = await e.target.files[0].text();
      const samlMetadataParsed = parseSAMLMetadata(text);
      if (!samlMetadataParsed.success) {
        enqueueSnackBar('Error parsing SAML metadata', {
          variant: SnackBarVariant.Error,
          duration: 2000,
        });
        return;
      }
      setValue('ssoURL', samlMetadataParsed.data.ssoUrl);
      setValue('certificate', samlMetadataParsed.data.certificate);
      setValue('issuer', samlMetadataParsed.data.entityID);
    }
  };

  const entityID = `${REACT_APP_SERVER_BASE_URL}/auth/saml/login/${getValues('id')}`;
  const acsUrl = `${REACT_APP_SERVER_BASE_URL}/auth/saml/callback`;

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  return (
    <>
      <Section>
        <H2Title
          title="Identity Provider Metadata XML"
          description="Upload the XML file with your connection infos"
        />
        <StyledUploadFileContainer>
          <StyledFileInput
            ref={inputFileRef}
            onChange={handleFileChange}
            type="file"
          />
          <Button
            Icon={IconUpload}
            onClick={handleUploadFileClick}
            title="Upload File"
          ></Button>
        </StyledUploadFileContainer>
      </Section>
      <Section>
        <H2Title
          title="Service Provider Details"
          description="Enter the infos to set the connection"
        />
        <StyledInputsContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <TextInput
                readOnly={true}
                label="ACS Url"
                value={acsUrl}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title="Copy"
                onClick={() => {
                  enqueueSnackBar('ACS Url copied to clipboard', {
                    variant: SnackBarVariant.Success,
                    icon: <IconCopy size={theme.icon.size.md} />,
                    duration: 2000,
                  });
                  navigator.clipboard.writeText(acsUrl);
                }}
              />
            </StyledButtonCopy>
          </StyledContainer>
          <StyledContainer>
            <StyledLinkContainer>
              <TextInput
                readOnly={true}
                label="Entity ID"
                value={entityID}
                fullWidth
              />
            </StyledLinkContainer>
            <StyledButtonCopy>
              <Button
                Icon={IconCopy}
                title="Copy"
                onClick={() => {
                  enqueueSnackBar('Entity ID copied to clipboard', {
                    variant: SnackBarVariant.Success,
                    icon: <IconCopy size={theme.icon.size.md} />,
                    duration: 2000,
                  });
                  navigator.clipboard.writeText(entityID);
                }}
              />
            </StyledButtonCopy>
          </StyledContainer>
        </StyledInputsContainer>
      </Section>
    </>
  );
};