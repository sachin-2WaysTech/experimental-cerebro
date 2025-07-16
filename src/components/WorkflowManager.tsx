import React from 'react';
import Modal from '@/components/Modal';
import * as Icons from 'lucide-react';

interface WorkflowManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-[#121212] text-white max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Workflow Manager</h2>
        </div>

        <div className="text-center py-12 text-gray-400">
          <Icons.Workflow size={48} className="mx-auto mb-4 opacity-50" />
          <p>Workflow management is temporarily disabled.</p>
          <p className="text-sm mt-2">The store has been removed for standalone operation.</p>
        </div>
      </div>
    </Modal>
  );
};

export default WorkflowManager;
