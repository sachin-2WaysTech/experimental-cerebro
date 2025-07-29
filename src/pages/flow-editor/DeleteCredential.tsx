import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import React from 'react';
interface DeleteCredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const DeleteCredentialModal: React.FC<DeleteCredentialModalProps> = ({
    isOpen,
    onClose,
}) => {
    const credentialName = "WhatsApp OAuth account 2";
    const { showToast, ToastContainer } = useToast();
    const handleDelete = () => {
        showToast('Credential successfully deleted', 'success');
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className="p-6 text-black">
                    <h2 className="text-lg font-semibold mb-2">Delete Credential?</h2>
                    <p className="mb-4">
                        Are you sure you want to delete <strong>{credentialName}</strong>? This may break any workflows that use it.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 border rounded text-gray-700"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded"
                            onClick={handleDelete}
                        >
                            Yes, delete
                        </button>
                    </div>
                </div>
            </Modal>
            <ToastContainer />
        </>
    );
};

export default DeleteCredentialModal;
