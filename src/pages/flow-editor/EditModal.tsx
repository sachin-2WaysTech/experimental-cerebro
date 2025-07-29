import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import Modal from "@/components/Modal";
import { useForm } from "react-hook-form";
import handleAxiosError from "@/lib/axiosErrorHandle";
import { getCredentialById } from "@/service/commonService";
import DeleteCredential from "./DeleteCredential";

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    credentialType: {
        name: string;
        display_name: string;
        description: string;
        icon: string;
        icon_color: string;
    };
    credentialId: string;
}

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    onClose,
    credentialType,
    credentialId,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const {
        register,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (!isOpen || !credentialId) return;

        const fetchCredential = async () => {
            try {
                setIsLoading(true);
                const res = await getCredentialById(credentialId);
                const data = res.data || {};

                reset({
                    client_id: data?.data?.client_id?.value || "",
                    client_secret: data?.data?.client_secret?.value || "",
                });
            } catch (err) {
                handleAxiosError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCredential();
    }, [credentialId, isOpen, reset]);



    const getIcon = (iconName?: string) => {
        if (!iconName || typeof iconName !== "string") return Icons.Circle;

        const iconKey = iconName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");

        const IconsMap = Icons as unknown as Record<
            string,
            React.ComponentType<{ size?: number; className?: string }>
        >;
        return IconsMap[iconKey] || Icons.Circle;
    };

    const IconComponent = getIcon(credentialType?.icon);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" variant="credential">
            <div className="relative">
                <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="absolute right-0 top-0 p-2 text-gray-400 hover:text-red-500"
                >
                    <Icons.Trash2 size={20} />
                </button>
                <DeleteCredential
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                />
                <div className="flex items-center gap-4 mb-6">
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-full text-white"
                        style={{ backgroundColor: credentialType?.icon_color || "#000" }}
                    >
                        <IconComponent size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-black">
                            {credentialType?.display_name || "Edit Credential"}
                        </h2>
                        <p className="text-sm text-black">{credentialType?.description}</p>
                    </div>
                </div>
                <form className="space-y-6">
                    <div className="space-y-4">
                        {/* Client ID */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600">
                                Client ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("client_id", {
                                    required: "Client ID is required",
                                })}
                                className={`w-full px-3 py-2 bg-white border ${errors.client_id ? "border-red-500" : "border-gray-600"
                                    } rounded-lg text-black placeholder-gray-500`}
                                placeholder="Enter Client ID"
                            />
                            {errors.client_id && (
                                <p className="text-sm text-red-500">
                                    {errors.client_id.message as string}
                                </p>
                            )}
                        </div>

                        {/* Client Secret */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600">
                                Client Secret <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("client_secret", {
                                    required: "Client Secret is required",
                                })}
                                className={`w-full px-3 py-2 bg-white border ${errors.client_secret ? "border-red-500" : "border-gray-600"
                                    } rounded-lg text-black placeholder-gray-500`}
                                placeholder="Enter Client Secret"
                            />
                            {errors.client_secret && (
                                <p className="text-sm text-red-500">
                                    {errors.client_secret.message as string}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 ">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-md hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditModal;
