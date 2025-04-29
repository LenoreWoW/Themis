import React from 'react';
import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { Box } from '@mui/material';

interface FormWithValidationProps<T extends FieldValues> {
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  onSubmit: (data: T) => void;
  defaultValues?: T;
}

export const FormWithValidation = <T extends FieldValues>({
  children,
  onSubmit,
  defaultValues,
}: FormWithValidationProps<T>) => {
  const methods = useForm<T>({
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
      {children(methods)}
    </Box>
  );
}; 