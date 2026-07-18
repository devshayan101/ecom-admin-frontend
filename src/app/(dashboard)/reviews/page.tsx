"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost, apiDelete, getApiError } from "@/lib/api-client";
import type { Review, PaginatedResponse } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { Star, MessageSquare, Check, X, Trash2, Search, ArrowRight } from "lucide-react";

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [historyCursors, setHistoryCursors] = useState<(string | undefined)[]>([]);

  // Modal State
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async (currentCursor?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: "10",
      };
      if (currentCursor) params.cursor = currentCursor;
      if (statusFilter !== "all") params.status = statusFilter;
      if (ratingFilter !== "all") params.rating = ratingFilter;

      const res = await apiGet<PaginatedResponse<Review>>("/reviews", params);
      if (res) {
        setReviews(res.items);
        setHasMore(res.has_more);
        setCursor(res.next_cursor);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHistoryCursors([]);
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryCursors([]);
    // Search is handled in-memory for this simple setup or can be extended, we query by filters
    fetchReviews();
  };

  const handleNextPage = () => {
    if (cursor) {
      setHistoryCursors((prev) => [...prev, cursor]);
      fetchReviews(cursor);
    }
  };

  const handlePrevPage = () => {
    const prevHistory = [...historyCursors];
    prevHistory.pop();
    setHistoryCursors(prevHistory);
    const prevCursor = prevHistory[prevHistory.length - 1];
    fetchReviews(prevCursor);
  };

  const handleStatusChange = async (id: string, newStatus: "approved" | "rejected" | "pending") => {
    try {
      await apiPatch(`/reviews/${id}`, { status: newStatus });
      toast.success(`Review ${newStatus} successfully`);
      fetchReviews(historyCursors[historyCursors.length - 1]);
      if (selectedReview && selectedReview._id === id) {
        setSelectedReview((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    try {
      await apiDelete(`/reviews/${id}`);
      toast.success("Review deleted successfully");
      setSelectedReview(null);
      fetchReviews(historyCursors[historyCursors.length - 1]);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    setSubmittingReply(true);
    try {
      const updatedReview = await apiPost<Review>(`/reviews/${selectedReview._id}/reply`, { text: replyText });
      toast.success("Admin reply saved");
      setSelectedReview(updatedReview);
      setReplyText("");
      fetchReviews(historyCursors[historyCursors.length - 1]);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status: Review["status"]) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  // Filter local reviews list in-memory for immediate search matching
  const filteredReviews = reviews.filter((r) => {
    if (!search) return true;
    const searchClean = search.toLowerCase();
    const customerMatch = r.customer_name.toLowerCase().includes(searchClean);
    const commentMatch = r.comment?.toLowerCase().includes(searchClean) || false;
    const titleMatch = r.title?.toLowerCase().includes(searchClean) || false;
    const productName = typeof r.product_id === "object" ? r.product_id.name.toLowerCase() : "";
    return customerMatch || commentMatch || titleMatch || productName.includes(searchClean);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Reviews</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage and respond to product ratings and feedback</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit border border-slate-200">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                statusFilter === status
                  ? "bg-white text-slate-800 dark:bg-slate-700 dark:text-white shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Rating Filter and Search */}
        <div className="flex items-center gap-3">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-1.5 text-sm outline-none focus:border-blue-500 placeholder-slate-400"
            />
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          title="No Reviews Found"
          description={statusFilter !== "all" ? `No reviews in the ${statusFilter} state match your query.` : "Customers haven't submitted any reviews yet."}
        />
      ) : (
        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review Summary</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((review) => {
                  const productName = typeof review.product_id === "object" ? review.product_id.name : "Unknown Product";
                  return (
                    <tr key={review._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 max-w-[200px] truncate">
                        {productName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {review.customer_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4.5 w-4.5 ${
                                i < review.rating ? "fill-current" : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[280px]">
                        <div className="font-bold text-slate-800 line-clamp-1">{review.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{review.comment}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold">
                        {new Date(review.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {review.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleStatusChange(review._id, "approved")}
                                className="h-7 w-7 p-0 border-green-200 text-green-600 hover:bg-green-50"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleStatusChange(review._id, "rejected")}
                                className="h-7 w-7 p-0 border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4.5 w-4.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedReview(review);
                              setReplyText(review.admin_reply?.text || "");
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(historyCursors.length > 0 || hasMore) && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevPage}
                disabled={historyCursors.length === 0}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Review Details & Reply Modal */}
      {selectedReview && (
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title="Review Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {typeof selectedReview.product_id === "object" ? selectedReview.product_id.name : "Product ID: " + selectedReview.product_id}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  Submitted by {selectedReview.customer_name} on {new Date(selectedReview.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="mb-2">{getStatusBadge(selectedReview.status)}</div>
                <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < selectedReview.rating ? "fill-current" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-3">
              {selectedReview.title && (
                <h4 className="font-extrabold text-slate-800 text-sm">"{selectedReview.title}"</h4>
              )}
              {selectedReview.comment ? (
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedReview.comment}</p>
              ) : (
                <p className="text-slate-400 italic text-xs">No written comments provided.</p>
              )}

              {/* Attached Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Attached Images</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.images.map((img, index) => (
                      <a href={img} target="_blank" rel="noopener noreferrer" key={index}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt="Review attachment"
                          className="h-16 w-16 object-cover rounded-md border border-slate-200 hover:opacity-85 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Action Bar (Approve/Reject inside modal) */}
            <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-700">Moderation Actions</p>
                <p className="text-[10px] text-slate-400 font-medium">Manage visibility of this review on storefront</p>
              </div>
              <div className="flex gap-2">
                {selectedReview.status !== "approved" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusChange(selectedReview._id, "approved")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                )}
                {selectedReview.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusChange(selectedReview._id, "rejected")}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDeleteReview(selectedReview._id)}
                  className="border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            {/* Admin Response/Reply */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <ArrowRight className="h-4 w-4 text-blue-500" />
                Response / Reply
              </h4>

              {selectedReview.admin_reply ? (
                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-slate-700 space-y-1">
                  <p className="font-bold text-xs text-blue-600">
                    Replied on {new Date(selectedReview.admin_reply.replied_at).toLocaleString()}
                  </p>
                  <p className="text-slate-600 leading-relaxed italic">"{selectedReview.admin_reply.text}"</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No response posted yet.</p>
              )}

              <form onSubmit={handlePostReply} className="space-y-3">
                <Textarea
                  placeholder="Type admin reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={submittingReply}
                  rows={3}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submittingReply || !replyText.trim()}>
                    {submittingReply ? "Submitting..." : selectedReview.admin_reply ? "Update Reply" : "Post Reply"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
