import React, { useState } from "react";
import { CheckCircle2, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useFeedback } from "../../hooks/useFeedback";
import type { FeedbackRating } from "../../services/feedback.service";

interface PostLessonFeedbackProps {
  bookingId: string;
  onClose: () => void;
}

export const PostLessonFeedback: React.FC<PostLessonFeedbackProps> = ({
  bookingId,
  onClose,
}) => {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");
  const { submitting, submitted, error, submitFeedback } = useFeedback();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) return;
    await submitFeedback({ bookingId, rating, comment });
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-navy/90 backdrop-blur-xl z-500 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl mx-auto flex items-center justify-center mb-5">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-navy mb-2">Merci !</h2>
          <p className="text-sm font-medium text-navy/50 mb-7">
            Votre retour a bien été envoyé.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue hover:bg-deepBlue text-white rounded-2xl py-3 font-black transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-navy/90 backdrop-blur-xl z-500 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(event) => event.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8"
      >
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue mb-2">
            Leçon terminée
          </p>
          <h2 className="text-2xl font-black text-navy">
            Comment s'est passée la leçon ?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setRating("LIKE")}
            className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
              rating === "LIKE"
                ? "border-green-500 bg-green-50 text-green-600"
                : "border-slate-100 bg-slate-50 text-navy/40 hover:border-green-200"
            }`}
          >
            <ThumbsUp className="w-8 h-8" />
            <span className="text-sm font-black">J'ai aimé</span>
          </button>
          <button
            type="button"
            onClick={() => setRating("DISLIKE")}
            className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
              rating === "DISLIKE"
                ? "border-red-500 bg-red-50 text-red-500"
                : "border-slate-100 bg-slate-50 text-navy/40 hover:border-red-200"
            }`}
          >
            <ThumbsDown className="w-8 h-8" />
            <span className="text-sm font-black">Pas aimé</span>
          </button>
        </div>

        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-navy/40 mb-2">
          Commentaire
        </label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
          maxLength={2000}
          rows={5}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-navy outline-none focus:border-blue focus:bg-white transition-colors resize-none"
          placeholder="Ajoutez un commentaire sur la leçon..."
        />

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={!rating || submitting}
            className="flex-1 bg-blue hover:bg-deepBlue disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl py-3 font-black transition-colors flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Envoyer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-black text-navy/50 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Plus tard
          </button>
        </div>
      </form>
    </div>
  );
};
