import React from 'react';
import { useForm, Controller, SubmitHandler, FieldValues, Control, DefaultValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Generic interface for form components
interface FormFieldProps {
  name: string;
  label: string;
  control?: Control<any>;
  errors?: Record<string, any>;
  disabled?: boolean;
  required?: boolean;
}

// Text Field Component
export const FormTextField: React.FC<FormFieldProps & { 
  multiline?: boolean;
  rows?: number;
  type?: string;
}> = ({ 
  name, 
  label, 
  control, 
  errors = {}, 
  disabled = false, 
  required = false,
  multiline = false,
  rows = 1,
  type = 'text'
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        label={label}
        fullWidth
        required={required}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        type={type}
        error={!!errors[name]}
        helperText={errors[name]?.message}
        InputProps={{
          sx: { borderRadius: 1.5 }
        }}
      />
    )}
  />
);

// Select Field Component
export const FormSelect: React.FC<FormFieldProps & { 
  options: { value: string | number; label: string }[];
  startIcon?: React.ReactNode;
}> = ({ 
  name, 
  label, 
  control, 
  errors = {}, 
  options, 
  disabled = false, 
  required = false,
  startIcon
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControl 
        fullWidth 
        required={required}
        error={!!errors[name]}
        disabled={disabled}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          {...field}
          label={label}
          sx={{ borderRadius: 1.5 }}
          startAdornment={startIcon}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {errors[name] && <FormHelperText>{errors[name]?.message}</FormHelperText>}
      </FormControl>
    )}
  />
);

// Date Picker Component
export const FormDatePicker: React.FC<FormFieldProps & {
  minDate?: Date;
  startIcon?: React.ReactNode;
}> = ({ 
  name, 
  label, 
  control, 
  errors = {}, 
  disabled = false, 
  required = false,
  minDate,
  startIcon
}) => (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DatePicker
          label={label}
          value={field.value}
          onChange={(date) => field.onChange(date)}
          disabled={disabled}
          minDate={minDate}
          slotProps={{
            textField: {
              fullWidth: true,
              required: required,
              error: !!errors[name],
              helperText: errors[name]?.message,
              InputProps: {
                startAdornment: startIcon,
                sx: { borderRadius: 1.5 }
              }
            }
          }}
        />
      )}
    />
  </LocalizationProvider>
);

// Main Form Component
interface FormWithValidationProps<T extends FieldValues> {
  defaultValues: DefaultValues<T>;
  validationSchema?: yup.ObjectSchema<any>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string;
}

function FormWithValidation<T extends FieldValues>({
  defaultValues,
  validationSchema,
  onSubmit,
  children,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  onCancel,
  title,
  subtitle,
  isLoading = false,
  error,
}: FormWithValidationProps<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<T>({
    defaultValues,
    ...(validationSchema && { resolver: yupResolver(validationSchema) }),
  });

  return (
    <>
      {title && (
        <Typography variant="h5" component="div" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
      )}
      
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) {
              return child;
            }
            
            // We only want to add control and errors to our custom form components
            const childType = child.type as any;
            const isCustomFormComponent = 
              childType === FormTextField || 
              childType === FormSelect || 
              childType === FormDatePicker;
            
            if (isCustomFormComponent) {
              // These are our form components, add control and errors
              return React.cloneElement(child, { 
                control, 
                errors 
              });
            }
            
            // Check if it's a grid or container that might contain our components
            if (typeof childType === 'function' || typeof childType === 'object') {
              // Recursively process children of this element
              return React.cloneElement(
                child,
                {},
                React.Children.map(child.props.children, (nestedChild) => {
                  if (!React.isValidElement(nestedChild)) {
                    return nestedChild;
                  }
                  
                  const nestedChildType = nestedChild.type as any;
                  const isNestedFormComponent = 
                    nestedChildType === FormTextField || 
                    nestedChildType === FormSelect || 
                    nestedChildType === FormDatePicker;
                  
                  if (isNestedFormComponent) {
                    return React.cloneElement(nestedChild, { 
                      control, 
                      errors 
                    });
                  }
                  
                  return nestedChild;
                })
              );
            }
            
            return child;
          })}
          
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            {onCancel && (
              <Button 
                onClick={onCancel} 
                disabled={isLoading}
              >
                {cancelButtonText}
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={24} /> : null}
            >
              {isLoading ? 'Processing...' : submitButtonText}
            </Button>
          </Box>
        </Stack>
      </Box>
    </>
  );
}

export default FormWithValidation; 