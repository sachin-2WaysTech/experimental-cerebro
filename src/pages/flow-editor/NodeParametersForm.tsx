import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as Icons from "lucide-react";
import type { NodeData, NodeParameter } from "../../service/nodeService";

interface NodeParametersFormProps {
  node: NodeData;
  onSave: (parameters: Record<string, unknown>) => void;
  onCancel: () => void;
}

const NodeParametersForm: React.FC<NodeParametersFormProps> = ({
  node,
  onSave,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: node.parameters || {},
  });

  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  // Watch all form values for conditional display
  const formValues = watch();

  // Update visible fields based on display conditions
  useEffect(() => {
    const newVisibleFields = new Set<string>();

    node.nodeType.parameters.forEach((param) => {
      let isVisible = true;

      if (param.display_options?.show) {
        isVisible = Object.entries(param.display_options.show).every(
          ([fieldName, allowedValues]) => {
            const currentValue = formValues[fieldName] as string;
            return allowedValues.includes(currentValue);
          }
        );
      }

      if (isVisible) {
        newVisibleFields.add(param.name);
      }
    });

    // Only update state if the visible fields actually changed
    setVisibleFields((prevVisible) => {
      const prevArray = Array.from(prevVisible).sort();
      const newArray = Array.from(newVisibleFields).sort();

      if (
        prevArray.length !== newArray.length ||
        !prevArray.every((field, index) => field === newArray[index])
      ) {
        return newVisibleFields;
      }
      return prevVisible;
    });
  }, [JSON.stringify(formValues)]); // Stringify to make comparison stable

  const renderField = (param: NodeParameter) => {
    if (!visibleFields.has(param.name)) return null;

    const commonProps = {
      ...register(param.name, { required: param.required }),
      className:
        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    };

    switch (param.type) {
      case "string":
        return (
          <input type="text" placeholder={param.description} {...commonProps} />
        );

      case "number":
        return (
          <input
            type="number"
            placeholder={param.description}
            min={param.type_options?.min_value}
            max={param.type_options?.max_value}
            step={
              param.type_options?.number_precision
                ? 1 / Math.pow(10, param.type_options.number_precision)
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
              {...register(param.name)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{param.description}</span>
          </label>
        );

      case "options":
        return (
          <select {...commonProps}>
            <option value="">Select {param.display_name}</option>
            {param.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        );

      case "multiOptions":
        return (
          <div className="space-y-2">
            {param.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option.value}
                  {...register(param.name)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.name}</span>
              </label>
            ))}
          </div>
        );

      case "dateTime":
        return <input type="datetime-local" {...commonProps} />;

      case "json":
        return (
          <textarea
            placeholder={param.description}
            rows={4}
            {...commonProps}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        );

      case "collection":
        return (
          <div className="space-y-2">
            <textarea
              placeholder="Enter JSON collection data"
              rows={3}
              {...commonProps}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            {param.type_options?.multiple_value_button_text && (
              <button
                type="button"
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                onClick={() => {
                  // Handle adding new collection item
                  console.log("Add collection item");
                }}
              >
                {param.type_options.multiple_value_button_text}
              </button>
            )}
          </div>
        );

      case "notice":
        return (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <Icons.Info className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {param.description}
              </span>
            </div>
          </div>
        );

      default:
        return (
          <input type="text" placeholder={param.description} {...commonProps} />
        );
    }
  };

  const onSubmit = (data: Record<string, unknown>) => {
    // Filter out empty values and convert types as needed
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    onSave(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {node.nodeType.parameters.map(
          (param) =>
            visibleFields.has(param.name) && (
              <div key={param.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {param.display_name}
                  {param.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {renderField(param)}

                {param.description && param.type !== "notice" && (
                  <p className="text-xs text-gray-500">{param.description}</p>
                )}

                {errors[param.name] && (
                  <p className="text-xs text-red-500">
                    {param.required
                      ? `${param.display_name} is required`
                      : "Invalid value"}
                  </p>
                )}
              </div>
            )
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Parameters
        </button>
      </div>
    </form>
  );
};

export default NodeParametersForm;
