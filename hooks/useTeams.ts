import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";

export interface CreateTeamData {
  name: string;
  identifier: string;
  description: string;
  organizationId: string;
}

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Team name is required")
    .min(2, "Name must be at least 2 characters"),
  identifier: yup
    .string()
    .required("Identifier is required")
    .min(2, "Identifier must be at least 2 characters")
    .max(5, "Identifier must be at most 5 characters")
    .matches(/^[A-Za-z0-9]+$/, "Identifier can only contain letters and numbers"),
  description: yup.string().default(""),
  organizationId: yup.string().required(),
});

interface UseTeamsOptions {
  onSuccess?: () => void;
}

export default function useTeams(options?: UseTeamsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTeamData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      identifier: "",
      description: "",
      organizationId: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log("Team form submission started:", data);
    setIsLoading(true);
    setApiError(null);
    try {
      await api.post("/api/teams", data);
      reset();
      setIsLoading(false);
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to create team";
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
    setValue
  };
}
