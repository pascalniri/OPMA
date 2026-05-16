import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentCategory = "requirements" | "designs" | "reports" | "contracts" | "other";

export interface VaultDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  s3Key: string;
  size: string;
  mimeType: string;
  tags: string[];
  projectId: string;
  milestoneId: string | null;
  activityId: string | null;
  powSubmissionId: string | null;
  uploadedById: string;
  uploadedBy: { id: string; name: string | null; image: string | null };
  milestone: { id: string; name: string } | null;
  activity: { id: string; title: string } | null;
  createdAt: string;
}

export interface VaultFilters {
  category?: DocumentCategory;
  milestoneId?: string;
  activityId?: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const CATEGORIES: DocumentCategory[] = ["requirements", "designs", "reports", "contracts", "other"];

const schema = yup.object({
  name: yup.string().required("Document name is required").min(1),
  category: yup.string<DocumentCategory>().oneOf(CATEGORIES).optional(),
  s3Key: yup.string().required("File key is required"),
  size: yup.string().required(),
  mimeType: yup.string().required(),
  tags: yup.array(yup.string().required()).optional(),
  milestoneId: yup.string().optional(),
  activityId: yup.string().optional(),
  powSubmissionId: yup.string().optional(),
});

export type UploadDocumentData = yup.InferType<typeof schema>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseVaultOptions {
  onSuccess?: (document: VaultDocument) => void;
}

export default function useVault(projectId: string, filters?: VaultFilters, options?: UseVaultOptions) {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", category: "other" as DocumentCategory, s3Key: "", size: "", mimeType: "" },
  });

  const fetchDocuments = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.milestoneId) params.set("milestoneId", filters.milestoneId);
      if (filters?.activityId) params.set("activityId", filters.activityId);
      const query = params.toString();
      const res = await api.get(`/api/projects/${projectId}/vault${query ? `?${query}` : ""}`);
      setDocuments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load vault documents");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters?.category, filters?.milestoneId, filters?.activityId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/projects/${projectId}/vault`, data);
      setDocuments((prev) => [res.data, ...prev]);
      reset();
      toast.success("Document added to vault");
      options?.onSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add document");
    } finally {
      setIsSubmitting(false);
    }
  });

  const remove = async (id: string): Promise<void> => {
    const tid = toast.loading("Removing document...");
    try {
      await api.delete(`/api/vault/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document removed", { id: tid });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove document", { id: tid });
      throw err;
    }
  };

  return {
    documents,
    isLoading,
    error,
    refresh: fetchDocuments,
    register,
    errors,
    onSubmit,
    isSubmitting,
    reset,
    setValue,
    remove,
  };
}
