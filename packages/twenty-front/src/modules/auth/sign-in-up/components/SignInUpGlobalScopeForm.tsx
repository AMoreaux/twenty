import styled from '@emotion/styled';
import {
  HorizontalSeparator,
  IconGoogle,
  IconMicrosoft,
  Loader,
  MainButton,
} from 'twenty-ui';
import { useTheme } from '@emotion/react';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpEmailField } from '@/auth/sign-in-up/components/SignInUpEmailField';
import { SignInUpPasswordField } from '@/auth/sign-in-up/components/SignInUpPasswordField';
import { useAuth } from '@/auth/hooks/useAuth';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import {
  SignInUpMode,
  signInUpModeState,
} from '@/auth/states/signInUpModeState';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';

const StyledContentContainer = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const validationSchema = z
  .object({
    exist: z.boolean(),
    email: z.string().trim().email('Email must be a valid email'),
    password: z
      .string()
      .regex(PASSWORD_REGEX, 'Password must contain at least 8 characters')
      .optional(),
    captchaToken: z.string().default(''),
  })
  .required();

export const SignInUpGlobalScopeForm = () => {
  const theme = useTheme();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const signInUpStep = useRecoilValue(signInUpStepState);

  const { signInWithGoogle } = useSignInWithGoogle();
  const { signInWithMicrosoft } = useSignInWithMicrosoft();
  const { checkUserExists } = useAuth();
  const { readCaptchaToken } = useReadCaptchaToken();

  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const [signInUpMode, setSignInUpMode] = useRecoilState(signInUpModeState);

  const { enqueueSnackBar } = useSnackBar();
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const [showErrors, setShowErrors] = useState(false);

  const { form } = useSignInUpForm();

  const { submitCredentials } = useSignInUp(form);

  const handleSubmit = async () => {
    if (isDefined(form?.formState?.errors?.email)) {
      setShowErrors(true);
      return;
    }

    if (signInUpStep === SignInUpStep.Password) {
      await submitCredentials(form.getValues());
      return;
    }

    const token = await readCaptchaToken();
    await checkUserExists.checkUserExistsQuery({
      variables: {
        email: form.getValues('email'),
        captchaToken: token,
      },
      onCompleted: (data) => {
        requestFreshCaptchaToken();
        if (
          data?.checkUserExists.exists &&
          data.checkUserExists.__typename === 'UserExists'
        ) {
          if (
            isDefined(data?.checkUserExists.availableWorkspaces) &&
            data.checkUserExists.availableWorkspaces.length >= 1
          ) {
            // return redirectToWorkspace(
            //   data?.checkUserExists.availableWorkspaces[0].subdomain,
            //   {
            //     email: form.getValues('email'),
            //   },
            // );
          }
        }
        if (
          data?.checkUserExists.exists &&
          data.checkUserExists.__typename === 'UserNotExists'
        ) {
          if (!isMultiWorkspaceEnabled) {
            return enqueueSnackBar('User not found', {
              variant: SnackBarVariant.Error,
            });
          }
          setSignInUpMode(SignInUpMode.SignUp);
          setSignInUpStep(SignInUpStep.Password);
        }
      },
    });
  };

  return (
    <>
      <StyledContentContainer>
        <>
          <MainButton
            Icon={() => <IconGoogle size={theme.icon.size.lg} />}
            title="Continue with Google"
            onClick={signInWithGoogle}
            fullWidth
          />
          <HorizontalSeparator visible={false} />
        </>
        <>
          <MainButton
            Icon={() => <IconMicrosoft size={theme.icon.size.lg} />}
            title="Continue with Microsoft"
            onClick={signInWithMicrosoft}
            fullWidth
          />
          <HorizontalSeparator visible={false} />
        </>
        <HorizontalSeparator visible />
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...form}>
          <StyledForm onSubmit={form.handleSubmit(handleSubmit)}>
            <SignInUpEmailField showErrors={showErrors} />
            {signInUpStep === SignInUpStep.Password && (
              <SignInUpPasswordField
                showErrors={showErrors}
                signInUpMode={signInUpMode}
              />
            )}

            <MainButton
              title={
                signInUpStep === SignInUpStep.Password ? 'Sign Up' : 'Continue'
              }
              type="submit"
              variant="secondary"
              Icon={() => (form.formState.isSubmitting ? <Loader /> : null)}
              fullWidth
            />
          </StyledForm>
        </FormProvider>
      </StyledContentContainer>
    </>
  );
};