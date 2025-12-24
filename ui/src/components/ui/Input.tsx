import { TextField, type TextFieldProps } from '@mui/material';

export const Input = (props: TextFieldProps) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      {...props}
    />
  );
};
