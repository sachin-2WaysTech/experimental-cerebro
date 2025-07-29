import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { NodeData, NodeParameter } from "../../service/nodeService";
import { useCredentialsStore } from "../../stores/nodes_store";
import CredentialModal from "../../components/CredentialModal";
import { useFieldVisibility } from "../../hooks/useFieldVisibility";
import FieldRenderer from "../../components/shared/FieldRenderer";
import { PencilSimple } from "phosphor-react";
import EditModal from "./EditModal";
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

  const [showCreateCredentialModal, setShowCreateCredentialModal] = useState(false);
  const [selectedCredentialType, setSelectedCredentialType] = useState<any>(null);
  const [selectedCredential, setSelectedCredential] = useState<any>(null)
  const credentials = useCredentialsStore((state) => state.credentials);
  const savedCredentials = useCredentialsStore((state) => state.savedCredentials);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState<Record<string, string>>({});

  // Watch all form values for conditional display
  const formValues = watch();

  // Use shared visibility hook for parameters
  const visibleFields = useFieldVisibility(node.nodeType.parameters, formValues);

  // Helper function to get saved credentials by type
  const getSavedCredentialsByType = (credentialType: string) => {
    return savedCredentials.filter(cred => cred.node_type === credentialType);
  };

  // Helper function to check if a parameter is a credential field
  const isCredentialField = (paramName: string) => {
    return node.nodeType.credentials?.some(cred => cred.name === paramName);
  };

  // Handler for credential selection change
  const handleCredentialSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    credentialName: string
  ) => {
    const value = event.target.value;
    console.log("Dropdown selected value:", value);

    if (value === "create_new") {
      const fullCredentialType = credentials.find(
        (cred) => cred.name === credentialName
      );
      console.log("Opening create modal for type:", fullCredentialType);
      setSelectedCredentialType(fullCredentialType);
      setShowCreateCredentialModal(true);
      return;
    }

    const fullCred = savedCredentials.find((c) => c.id === value);
    console.log("Setting selectedCredential:", value);
    console.log("Resolved full credential:", fullCred);

    setSelectedCredential(value);
    setSelectedCredentials((prev) => ({
      ...prev,
      [credentialName]: value,
    }));
  };





  const renderCredentialField = (credentialDef: { name: string; display_name: string; required: boolean }) => {
    // Get saved credentials for this credential type
    const savedCredentialsForType = Array.from(
      new Map(getSavedCredentialsByType(credentialDef.name).map(cred => [cred.id, cred])).values()
    );


    const commonProps = {
      ...register(credentialDef.name, { required: credentialDef.required }),
      className:
        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    };
    const selectedCredentialObj = savedCredentials.find(
      (cred) => cred.id === selectedCredential
    );
    return (
      <div className="flex items-center gap-1">
        <div className="relative w-[90%]">
          <select
            {...commonProps}
            value={selectedCredentials[credentialDef.name] || ""}
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

        <button
          type="button"
          onClick={() => {
            console.log("Opening edit modal");
            console.log("Selected Credential ID:", selectedCredential);
            const selectedCredentialObj = savedCredentials.find(
              (cred) => cred.id === selectedCredential
            );
            console.log("Resolved Credential Type:", selectedCredentialObj);
            setIsEditOpen(true);
          }}

          className="p-1 hover:bg-gray-400 rounded-md text-gray-500"
        >
          <PencilSimple size={16} weight="light" />
        </button>


        {selectedCredentialObj && (
          <EditModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            credentialType={selectedCredentialObj}
            credentialId={selectedCredential}
          />
        )}

      </div>
    );
  };

  const renderField = (param: NodeParameter) => {
    if (!visibleFields.has(param.name)) return null;

    // Check if this is a credential field
    if (isCredentialField(param.name)) {
      return null; // Credential fields are rendered separately
    }

    return (
      <FieldRenderer
        field={param}
        register={register}
        errors={errors}
        theme="light"
      />
    );
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
              visibleFields.has(param.name) && !isCredentialField(param.name) && (
                <div key={param.name}>
                  {renderField(param)}
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
