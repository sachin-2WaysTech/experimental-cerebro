import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as Icons from "lucide-react";
import type { NodeData, NodeParameter } from "../../service/nodeService";
import { useCredentialsStore } from "../../stores/nodes_store";
import CredentialModal from "../../components/CredentialModal";

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
  const [showCreateCredentialModal, setShowCreateCredentialModal] = useState(false);
  const [selectedCredentialType, setSelectedCredentialType] = useState<any>(null);
  const credentials = useCredentialsStore((state) => state.credentials);
  const savedCredentials = useCredentialsStore((state) => state.savedCredentials);

  // Watch all form values for conditional display
  const formValues = watch();

  // Helper function to get saved credentials by type
  const getSavedCredentialsByType = (credentialType: string) => {
    return savedCredentials.filter(cred => cred.type === credentialType);
  };

  // Helper function to check if a parameter is a credential field
  const isCredentialField = (paramName: string) => {
    return node.nodeType.credentials?.some(cred => cred.name === paramName);
  };

  // Handler for credential selection change
  const handleCredentialSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, credentialName: string) => {
    if (event.target.value === "create_new") {
      // Find the full credential definition from the credentials store
      const fullCredentialType = credentials.find(cred => cred.name === credentialName);
      setSelectedCredentialType(fullCredentialType);
      setShowCreateCredentialModal(true);
      // Reset the select to empty value
      event.target.value = "";
    }
  };

  // Update visible fields based on display conditions and dependencies
  useEffect(() => {
    const newVisibleFields = new Set<string>();

    // Always add credential fields to visible fields (they're always shown)
    node.nodeType.credentials?.forEach((credentialDef) => {
      newVisibleFields.add(credentialDef.name);
    });

    node.nodeType.parameters.forEach((param) => {
      let isVisible = true;

      // Check display_options.show conditions
      if (param.display_options?.show) {
        isVisible = Object.entries(param.display_options.show).every(
          ([fieldName, allowedValues]) => {
            const currentValue = formValues[fieldName] as string;
            return allowedValues.includes(currentValue);
          }
        );
      }

      // Check depends_on conditions (fields should have values)
      if (isVisible && param.depends_on && param.depends_on.length > 0) {
        isVisible = param.depends_on.every((dependencyField: string) => {
          const dependencyValue = formValues[dependencyField];
          return dependencyValue !== undefined && dependencyValue !== null && dependencyValue !== "";
        });
      }

      // Check load_options_depends_on conditions (fields should have values)
      if (isVisible && param.type_options?.load_options_depends_on && param.type_options.load_options_depends_on.length > 0) {
        isVisible = param.type_options.load_options_depends_on.every((dependencyField: string) => {
          const dependencyValue = formValues[dependencyField];
          return dependencyValue !== undefined && dependencyValue !== null && dependencyValue !== "";
        });
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

  const renderCredentialField = (credentialDef: { name: string; display_name: string; required: boolean }) => {
    // Get saved credentials for this credential type
    const savedCredentialsForType = getSavedCredentialsByType(credentialDef.name);

    const commonProps = {
      ...register(credentialDef.name, { required: credentialDef.required }),
      className:
        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    };

    return (
      <div className="space-y-2">
        <select
          {...commonProps}
          onChange={(e) => handleCredentialSelectChange(e, credentialDef.name)}
        >
          <option value="">Select {credentialDef.display_name}</option>
          {savedCredentialsForType.map((credential) => (
            <option key={credential.id} value={credential.id}>
              {credential.display_name}
            </option>
          ))}
          <option value="create_new" className="border-t border-gray-300 font-medium text-blue-600">
            + Create New API Key
          </option>
        </select>
        {savedCredentialsForType.length === 0 && (
          <p className="text-xs text-gray-500">
            No saved credentials found. Create a new one to get started.
          </p>
        )}
      </div>
    );
  };

  const renderField = (param: NodeParameter) => {
    if (!visibleFields.has(param.name)) return null;

    // Check if this is a credential field
    if (isCredentialField(param.name)) {
      return renderCredentialField(param);
    }

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

  const handleCloseCredentialModal = () => {
    setShowCreateCredentialModal(false);
    setSelectedCredentialType(null);
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
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Render credential fields first */}
          {node.nodeType.credentials?.map((credentialDef) => (
            <div key={credentialDef.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {credentialDef.display_name}
                {credentialDef.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {renderCredentialField(credentialDef)}

              <p className="text-xs text-gray-500">
                Select or create credentials for {credentialDef.display_name}
              </p>

              {errors[credentialDef.name] && (
                <p className="text-xs text-red-500">
                  {credentialDef.required
                    ? `${credentialDef.display_name} is required`
                    : "Invalid value"}
                </p>
              )}
            </div>
          ))}

          {/* Render regular parameter fields */}
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

      {/* Credential Creation Modal */}
      <CredentialModal
        isOpen={showCreateCredentialModal}
        onClose={handleCloseCredentialModal}
        credentialType={selectedCredentialType}
      />
    </>
  );
};

export default NodeParametersForm;
