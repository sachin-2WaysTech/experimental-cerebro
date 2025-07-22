import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import * as Icons from 'lucide-react';

interface BaseField {
  name: string;
  type: string;
  display_name: string;
  description: string;
  required: boolean;
  placeholder?: string;
  sensitive?: boolean;
  default?: any;
  options?: Array<{
    name: string;
    value: string;
    description?: string;
  }>;
  type_options?: {
    min_value?: number;
    max_value?: number;
    multiple_values?: boolean;
    multiple_value_button_text?: string;
    number_precision?: number;
    [key: string]: any;
  };
}

interface FieldRendererProps {
  field: BaseField;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  theme?: 'light' | 'dark';
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  register,
  errors,
  theme = 'light'
}) => {
  const getCommonProps = () => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const themeClasses = theme === 'dark' 
      ? "bg-[#2a2a2a] border-gray-600 text-white placeholder-gray-400"
      : "border-gray-300 text-gray-900 placeholder-gray-500";
    
    return {
      ...register(field.name, { required: field.required }),
      className: `${baseClasses} ${themeClasses}`,
    };
  };

  const renderField = () => {
    const commonProps = getCommonProps();

    switch (field.type) {
      case "string":
        return (
          <input
            type={field.sensitive ? "password" : "text"}
            placeholder={field.placeholder || field.description}
            {...commonProps}
          />
        );

      case "number":
        return (
          <input
            type="number"
            placeholder={field.placeholder || field.description}
            min={field.type_options?.min_value}
            max={field.type_options?.max_value}
            step={
              field.type_options?.number_precision
                ? 1 / Math.pow(10, field.type_options.number_precision)
                : 1
            }
            {...commonProps}
          />
        );

      case "boolean":
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register(field.name)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {field.description}
            </span>
          </label>
        );

      case "options":
        return (
          <select {...commonProps}>
            <option value="">Select {field.display_name}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        );

      case "multiOptions":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option.value}
                  {...register(field.name)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.name}
                </span>
              </label>
            ))}
          </div>
        );

      case "dateTime":
        return <input type="datetime-local" {...commonProps} />;

      case "json":
        return (
          <textarea
            placeholder={field.placeholder || field.description}
            rows={4}
            {...commonProps}
            className={`${commonProps.className} font-mono text-sm`}
          />
        );

      case "collection":
        return (
          <div className="space-y-2">
            <textarea
              placeholder="Enter JSON collection data"
              rows={3}
              {...commonProps}
              className={`${commonProps.className} font-mono text-sm`}
            />
            {field.type_options?.multiple_value_button_text && (
              <button
                type="button"
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                onClick={() => {
                  // Handle adding new collection item
                  console.log("Add collection item");
                }}
              >
                {field.type_options.multiple_value_button_text}
              </button>
            )}
          </div>
        );

      case "notice":
        return (
          <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-center space-x-2">
              <Icons.Info className={`w-4 h-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'}`}>
                {field.description}
              </span>
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder || field.description}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {field.display_name}
        {field.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {renderField()}

      {field.description && field.type !== "notice" && (
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {field.description}
        </p>
      )}

      {errors[field.name] && (
        <p className="text-xs text-red-500">
          {field.required
            ? `${field.display_name} is required`
            : "Invalid value"}
        </p>
      )}
    </div>
  );
};

export default FieldRenderer;
