import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PowSubmission {
  id: string;
  status: "AWAITING_REVIEW" | "APPROVED" | "REJECTED";
  notes: string | null;
  activityId: string;
  submitterId: string;
  reviewerId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  submitter: { id: string; name: string | null };
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const submitSchema = yup.object({
  notes: yup.string().optional(),
  documentIds: yup.array(yup.string().required()).optional(),
});

const reviewSchema = yup.object({
  status: yup.string<"APPROVED" | "REJECTED">().required("Decision is required"),
  notes: yup.string().optional(),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UsePowOptions {
  onSubmitSuccess?: (submission: PowSubmission) => void;
  onReviewSuccess?: (result: { submission: PowSubmission; activity: unknown }) => void;
}

export default function usePow(activityId: string, options?: UsePowOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Submit form
  const {
    register: registerSubmit,
    handleSubmit: handleSubmitForm,
    reset: resetSubmit,
    formState: { errors: submitErrors },
  } = useForm({
    resolver: yupResolver(submitSchema),
    defaultValues: { notes: "" },
  });

  // Review form
  const {
    register: registerReview,
    handleSubmit: handleReviewForm,
    reset: resetReview,
    setValue: setReviewValue,
    formState: { errors: reviewErrors },
  } = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: { notes: "" },
  });

  const onSubmit = handleSubmitForm(async (data) => {
    setIsSubmitting(true);
    const tid = toast.loading("Submitting proof of work...");
    try {
      const res = await api.post(`/api/activities/${activityId}/pow`, data);
      resetSubmit();
      toast.success("Proof of Work submitted — awaiting review", { id: tid });
      options?.onSubmitSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit Proof of Work", { id: tid });
    } finally {
      setIsSubmitting(false);
    }
  });

  const onReview = handleReviewForm(async (data) => {
    setIsReviewing(true);
    const tid = toast.loading(data.status === "APPROVED" ? "Approving..." : "Rejecting...");
    try {
      const res = await api.patch(`/api/activities/${activityId}/pow`, data);
      resetReview();
      toast.success(
        data.status === "APPROVED" ? "Proof of Work approved ✓" : "Proof of Work rejected",
        { id: tid },
      );
      options?.onReviewSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to review Proof of Work", { id: tid });
    } finally {
      setIsReviewing(false);
    }
  });

  return {
    // Submit form
    registerSubmit,
    onSubmit,
    submitErrors,
    isSubmitting,
    resetSubmit,
    // Review form
    registerReview,
    onReview,
    reviewErrors,
    isReviewing,
    resetReview,
    setReviewValue,
  };
}
