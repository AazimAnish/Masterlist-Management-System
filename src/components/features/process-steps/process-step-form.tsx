'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ProcessStepFormData } from '@/validations/process-step.schema';
import { ProcessStep } from '@/types/process-step';
import { Process } from '@/types/process';

interface Option {
  value: string;
  label: string;
  tooltip?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  isMulti?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  label,
  isMulti = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  const selectedValues = isMulti 
    ? (Array.isArray(value) ? value : [])
    : (typeof value === 'string' ? [value] : []);
  
  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.value)
  );

  const handleSelect = (optionValue: string) => {
    if (isMulti) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setOpen(false);
    }
  };

  const removeValue = (optionValue: string) => {
    if (isMulti) {
      const newValue = selectedValues.filter(v => v !== optionValue);
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <div className="relative">
            {isMulti && selectedOptions.length > 0 && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
            )}
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  'w-full justify-between',
                  error && 'border-red-500',
                  !error && 'hover:border-muted'
                )}
              >
                {isMulti && selectedOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions.map(option => (
                      <Badge key={option.value} variant="secondary">
                        {option.label}
                        <X className="ml-1 h-4 w-4" onClick={() => removeValue(option.value)} />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {options.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValues.includes(option.value) && 'opacity-100'
                        )}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipContent>
                            {option.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </div>
        </TooltipProvider>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </Popover>
    </div>
  );
}

interface ProcessStepFormProps {
  processes: Process[];
  existingSteps?: ProcessStep[];
  onSubmit: (data: ProcessStepFormData) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: ProcessStepFormData;
}

export default function ProcessStepForm({
  processes,
  existingSteps = [],
  onSubmit,
  isSubmitting: externalIsSubmitting,
  initialData,
}: ProcessStepFormProps) {
  // ... rest of the component remains the same ...
}
