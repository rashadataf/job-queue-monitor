import { Card as MuiCard, CardContent as MuiCardContent, Typography, type CardProps as MuiCardProps, type CardContentProps, type TypographyProps } from '@mui/material';
import type { HTMLAttributes } from 'react';

export const Card = (props: MuiCardProps) => {
  return <MuiCard variant="outlined" {...props} />;
}

export const CardHeader = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div style={{ padding: '16px 16px 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }} {...props} />;
}

export const CardTitle = (props: TypographyProps) => {
  return <Typography variant="h6" component="h2" {...props} />;
}

export const CardDescription = (props: TypographyProps) => {
  return <Typography variant="body2" color="text.secondary" {...props} />;
}

export const CardContent = (props: CardContentProps) => {
  return <MuiCardContent {...props} />;
}

export const CardFooter = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div style={{ padding: '16px', paddingTop: 0, display: 'flex', alignItems: 'center' }} {...props} />;
}