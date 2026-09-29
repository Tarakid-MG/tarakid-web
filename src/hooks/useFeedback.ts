import { useCallback, useState } from "react";
import {
  feedbackService,
  type FeedbackRating,
} from "../services/feedback.service";

interface SubmitFeedbackInput {
  bookingId: string;
  rating: FeedbackRating;
  comment: string;
}

export const useFeedback = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(
    async ({ bookingId, rating, comment }: SubmitFeedbackInput) => {
      setSubmitting(true);
      setError(null);
      try {
        await feedbackService.create({
          bookingId,
          rating,
          comment: comment.trim() || undefined,
        });
        setSubmitted(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible d'envoyer le feedback.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return {
    submitting,
    submitted,
    error,
    submitFeedback,
  };
};
