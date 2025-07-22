import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Icons from 'lucide-react';
import Modal from './Modal';
import { useCredentialsStore } from '../stores/nodes_store';
import type { CredentialParameter } from '../stores/nodes_store';
import { useFieldVisibility } from '../hooks/useFieldVisibility';
import FieldRenderer from './shared/FieldRenderer';

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentialType: {
    name: string;
    display_name: string;
    description: string;
    icon: string;
    icon_color: string;
    parameters: CredentialParameter[];
  } | null;
}

const CredentialModal: React.FC<CredentialModalProps> = ({
  isOpen,
  onClose,
  credentialType,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const createCredential = useCredentialsStore((state) => state.createCredential);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  // Watch all form values for conditional display
  const formValues = watch();

  // Use shared visibility hook
  const visibleFields = useFieldVisibility(credentialType?.parameters || [], formValues);



  const onSubmit = async (data: Record<string, unknown>) => {
    if (!credentialType) return;

    setIsLoading(true);
    try {
      // Create display name from the name if not provided
      const displayName = data.display_name as string || data.name as string || `${credentialType.display_name} Credential`;
      
      await createCredential({
        name: data.name as string,
        display_name: displayName,
        type: credentialType.name,
        data: data,
      });

      reset();
      onClose();
    } catch (error) {
      console.error('Error creating credential:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const renderField = (param: CredentialParameter) => {
    if (!visibleFields.has(param.name)) return null;

    return (
      <FieldRenderer
        field={param}
        register={register}
        errors={errors}
      />
    );
  };

  if (!credentialType) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Create ${credentialType.display_name} Credential`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Credential Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-500">
              Credential Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter a name for this credential"
              {...register('name', { required: true })}
              className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-white placeholder-gray-500"
            />
            {errors.name && (
              <p className="text-xs text-red-500">Credential name is required</p>
            )}
          </div>

          {/* Display Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-500">
              Display Name
            </label>
            <input
              type="text"
              placeholder="Enter a display name (optional)"
              {...register('display_name')}
              className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-white placeholder-gray-500"
            />
          </div>

          {/* Dynamic Fields based on credential type parameters */}
          {credentialType.parameters.map((param) =>
            visibleFields.has(param.name) && (
              <div key={param.name}>
                {renderField(param)}
              </div>
            )
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Credential'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CredentialModal;
