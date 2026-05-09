import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export interface CreateOrgData {
  name: string;
  slug: string;
}

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Workspace name is required")
    .min(2, "Name must be at least 2 characters"),
  slug: yup
    .string()
    .required("Slug is required")
    .min(2, "Slug must be at least 2 characters")
    .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});

interface UseOrganizationsOptions {
  onSuccess?: () => void;
}

export default function useOrganizations(options?: UseOrganizationsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateOrgData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  const onSubmit = handleSubmit(async (data: CreateOrgData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await api.post<Organization>("/api/organizations", data);
      reset();
      setIsLoading(false);
      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to create workspace";
      setApiError(message);
      setIsLoading(false);
    }
  });

  return {
    register,
    errors,
    onSubmit,
    isLoading,
    apiError,
    reset,
  };
}