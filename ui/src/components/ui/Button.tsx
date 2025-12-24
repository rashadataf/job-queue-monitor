import type { ElementType } from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import { ButtonVariant } from '@/types/button';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: ButtonVariant;
  component?: ElementType;
  to?: string;
}

export const Button = ({ variant = ButtonVariant.DEFAULT, ...props }: ButtonProps) => {
  let muiVariant: MuiButtonProps['variant'] = 'contained';
  let color: MuiButtonProps['color'] = 'primary';

  switch (variant) {
    case ButtonVariant.DESTRUCTIVE:
      color = 'error';
      break;
    case ButtonVariant.OUTLINE:
      muiVariant = 'outlined';
      break;
    case ButtonVariant.GHOST:
      muiVariant = 'text';
      break;
    case ButtonVariant.SECONDARY:
      color = 'secondary';
      break;
    case ButtonVariant.LINK:
      muiVariant = 'text';
      break;
    default:
      break;
  }

  return <MuiButton variant={muiVariant} color={color} {...props} />;
}

