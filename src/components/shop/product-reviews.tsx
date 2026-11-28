"use client";

/**
 * Live product reviews.
 *
 * - Reads approved reviews + rating summary from the reviews store
 *   (`GET /products/:productId/reviews`).
 * - Signed-in buyers with a DELIVERED order for this product can submit a
 *   review (`POST /products/:productId/reviews`), which stays pending until an
 *   admin approves it.
 * - Owners can edit (`PUT /reviews/:id`) or delete (`DELETE /reviews/:id`)
 *   their own review.
 */

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/shop/star-rating";
import { useReviews } from "@/lib/stores/reviews-store";
import { useAuth } from "@/lib/stores/auth-store";
import { ordersService } from "@/lib/services/orders.service";
import { ApiError } from "@/lib/api-client";
import type { ApiOrder } from "@/lib/api-types";

function RatingSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-11 w-32 rounded-md border bg-background px-3 text-sm"
    >
      {[5, 4, 3, 2, 1].map((n) => (
        <option key={n} value={n}>
          {n} star{n === 1 ? "" : "s"}
        </option>
      ))}
    </select>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const bucket = useReviews((s) => s.byProduct[productId]);
  const load = useReviews((s) => s.loadForProduct);
  const createReview = useReviews((s) => s.create);
  const updateReview = useReviews((s) => s.update);
  const removeReview = useReviews((s) => s.remove);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    load(productId);
  }, [productId, load]);

  // Delivered orders that contain this product (eligible to review)
  const [eligible, setEligible] = useState<ApiOrder[]>([]);
  useEffect(() => {
    if (!user) {
      setEligible([]);
      return;
    }
    let cancelled = false;
    ordersService
      .getAll({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setEligible(
          res.items.filter(
            (o) =>
              o.status === "DELIVERED" &&
              o.items.some((it) => it.variant?.productId === productId)
          )
        );
      })
      .catch(() => {
        if (!cancelled) setEligible([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, productId]);

  const reviews = bucket?.reviews ?? [];
  const average = bucket?.average ?? 0;
  const total = bucket?.total ?? 0;

  const ownReview = useMemo(
    () => (user ? reviews.find((r) => r.userId === user.id) : undefined),
    [reviews, user]
  );

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [edit, setEdit] = useState({ rating: 5, title: "", body: "" });

  // Seed the edit form when the owner's review arrives
  useEffect(() => {
    if (ownReview) {
      setEdit({
        rating: ownReview.rating,
        title: ownReview.title ?? "",
        body: ownReview.body ?? "",
      });
    }
  }, [ownReview]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (eligible.length === 0) return;
    if (!form.body.trim()) {
      toast.error("Please write a few words about the skin.");
      return;
    }
    setSubmitting(true);
    try {
      await createReview(productId, {
        orderId: eligible[0].id,
        rating: form.rating,
        title: form.title.trim() || undefined,
        body: form.body.trim(),
      });
      setForm({ rating: 5, title: "", body: "" });
      toast.success("Thanks! Your review is pending approval.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-sm text-muted-foreground">
          {total > 0
            ? `${average.toFixed(1)} average · ${total} review${total === 1 ? "" : "s"}`
            : "No reviews yet"}
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-3 text-muted-foreground">
          No reviews yet — bought this skin? Leave the first one after delivery.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <StarRating rating={r.rating} size="md" />
                <span className="text-xs text-muted-foreground">
                  {r.user?.name ?? "Verified buyer"}
                </span>
              </div>
              {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
              {user && r.userId === user.id && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      try {
                        await removeReview(productId, r.id);
                        toast.success("Review deleted.");
                      } catch {
                        toast.error("Could not delete the review.");
                      }
                    }}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Owner: edit their review */}
      {user && ownReview && (
        <form
          className="mt-8 max-w-lg rounded-xl border bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await updateReview(productId, ownReview.id, {
                rating: edit.rating,
                title: edit.title.trim(),
                body: edit.body.trim(),
              });
              toast.success("Review updated — pending re-approval.");
            } catch {
              toast.error("Could not update the review.");
            }
          }}
        >
          <h3 className="flex items-center gap-2 font-heading font-semibold">
            <Pencil className="size-4 text-primary" /> Edit your review
          </h3>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rv-edit-rating">Rating</Label>
              <RatingSelect
                id="rv-edit-rating"
                value={edit.rating}
                onChange={(rating) => setEdit({ ...edit, rating })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rv-edit-title">Title</Label>
              <Input
                id="rv-edit-title"
                className="h-11"
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rv-edit-body">Your review</Label>
              <textarea
                id="rv-edit-body"
                value={edit.body}
                onChange={(e) => setEdit({ ...edit, body: e.target.value })}
                rows={4}
                className="w-full rounded-md border bg-background p-3 text-sm"
              />
            </div>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      )}

      {/* New review */}
      {user && eligible.length > 0 && !ownReview && (
        <form onSubmit={submit} className="mt-8 max-w-lg rounded-xl border bg-card p-5">
          <h3 className="font-heading font-semibold">Write a review</h3>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rv-rating">Rating</Label>
              <RatingSelect
                id="rv-rating"
                value={form.rating}
                onChange={(rating) => setForm({ ...form, rating })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rv-title">Title</Label>
              <Input
                id="rv-title"
                className="h-11"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Sums it up"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rv-body">Your review</Label>
              <textarea
                id="rv-body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                className="w-full rounded-md border bg-background p-3 text-sm"
                placeholder="How does the skin fit and feel?"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
