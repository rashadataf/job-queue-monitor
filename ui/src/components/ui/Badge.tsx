import { Chip, type ChipProps } from '@mui/material';
import { JobStatus } from '@shared';

export interface BadgeProps extends Omit<ChipProps, 'variant' | 'color'> {
  variant?: JobStatus;
}

export const Badge = ({ variant = JobStatus.PENDING, ...props }: BadgeProps) => {
  let color: ChipProps['color'] = 'primary';
  const muiVariant: ChipProps['variant'] = 'filled';

  switch (variant) {
    case JobStatus.FAILED:
      color = 'error';
      break;
    case JobStatus.COMPLETED:
      color = 'success';
      break;
    case JobStatus.RUNNING:
      color = 'info';
      break;
    case JobStatus.PENDING:
      color = 'warning';
      break;
    default:
      break;
  }

  return <Chip size="small" color={color} variant={muiVariant} {...props} />;
}
