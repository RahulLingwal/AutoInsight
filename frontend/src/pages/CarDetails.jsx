import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function CarDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(() =>
    JSON.parse(sessionStorage.getItem("ai_user") || "null"),
  );
  // Photo carousel index state
  const [photoIndex, setPhotoIndex] = useState(0);

  // Form states for creating / editing review
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    api
      .get(`/cars/${id}`)
      .then(setData)
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => {
    loadData();
    setUser(JSON.parse(sessionStorage.getItem("ai_user") || "null"));
  }, [id]);

  const existingReview = data?.reviews?.find((r) => r.userId === user?.id);

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setTitle(review.title);
    setBody(review.body);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setTitle("");
    setBody("");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setError("");
      await api.delete(`/reviews/${reviewId}`);
      setSuccess("Review deleted successfully.");
      if (editingReviewId === reviewId) handleCancelEdit();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, {
          rating: Number(rating),
          title,
          body,
        });
        setSuccess("Review & rating updated successfully!");
        handleCancelEdit();
      } else {
        await api.post("/reviews", {
          carId: Number(id),
          rating: Number(rating),
          title: title || `${rating} Star Rating`,
          body: body || `Rated ${rating}/5 stars.`,
        });
        setSuccess("Review & rating submitted successfully!");
        handleCancelEdit();
      }
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link className="text-blue-400 hover:underline" to="/cars">
        ‹ Back to Cars
      </Link>
      <section className="panel mt-6 p-8">
        {error && (
          <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
            {success}
          </p>
        )}
        {data && (
          <>
            {/* Photo carousel with small frame */}
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gray-800/30">
              {data.car.images && data.car.images.length > 1 ? (
                <>
                  <img
                    className="h-full w-full object-cover transition-opacity duration-300"
                    src={data.car.images[photoIndex]?.startsWith('/') ? data.car.images[photoIndex] : `/${data.car.images[photoIndex]}`}
                    alt={`${data.car.brand} ${data.car.model} photo ${photoIndex + 1}`}
                    onError={(e) => { e.target.src = "/Asset/Images/bmw.jpg"; }}
                  />
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                    onClick={() => setPhotoIndex((photoIndex - 1 + data.car.images.length) % data.car.images.length)}
                  >‹</button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                    onClick={() => setPhotoIndex((photoIndex + 1) % data.car.images.length)}
                  >›</button>
                </>
              ) : (
                <img
                  className="h-full w-full object-cover"
                  src={data.car.image?.startsWith('/') ? data.car.image : `/${data.car.image}`}
                  alt={`${data.car.brand} ${data.car.model}`}
                  onError={(e) => { e.target.src = "/Asset/Images/bmw.jpg"; }}
                />
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black">
                  {data.car.brand} {data.car.model}
                </h1>
                <p className="mt-2 text-slate-400">
                  {data.car.year} Model · {data.car.fuel} · {data.car.seats} seats ·{" "}
                  {data.car.bodyType}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xl font-bold text-yellow-400">
                  ★ {data.car.rating} / 5
                </span>
                <span className="text-sm text-slate-400">
                  ({data.reviews.length} {data.reviews.length === 1 ? "rating" : "ratings"})
                </span>
                <span className="ml-4 text-3xl font-extrabold text-blue-400">
                  ₹{data.car.price}L
                </span>
              </div>
            </div>

            {/* Rate & Review Card */}
            <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6">
              <h2 className="text-2xl font-bold">
                {editingReviewId
                  ? "Edit Your Rating & Review"
                  : existingReview
                  ? "Your Rating for this Car"
                  : "Rate & Review this Car"}
              </h2>

              {!user ? (
                <p className="mt-3 text-slate-400">
                  Please{" "}
                  <Link to="/login" className="text-blue-400 underline font-semibold">
                    log in
                  </Link>{" "}
                  to rate this car (0 to 5 stars) and write a review.
                </p>
              ) : existingReview && !editingReviewId ? (
                <div className="mt-4 rounded-xl bg-white/5 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold text-lg">
                        ★ {existingReview.rating} / 5
                      </span>
                      <strong className="text-white">{existingReview.title}</strong>
                    </div>
                    <p className="mt-1 text-slate-300 text-sm">{existingReview.body}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(existingReview)}
                      className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500 hover:text-white"
                    >
                      Edit Review & Rating
                    </button>
                    <button
                      onClick={() => handleDeleteReview(existingReview.id)}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300">
                      Select Rating (0 to 5)
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-base font-bold transition ${
                            rating === val
                              ? "border-yellow-400 bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-yellow-400/50 hover:bg-white/10"
                          }`}
                        >
                          {val}★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-yellow-400 font-semibold">
                        Selected: {rating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300">
                      Title
                    </label>
                    <input
                      className="field mt-1"
                      placeholder="e.g. Great mileage and handling"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300">
                      Review Description
                    </label>
                    <textarea
                      className="field mt-1 min-h-24"
                      placeholder="Share your detailed feedback or thoughts about this car..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="primary-button py-2.5 text-sm"
                    >
                      {submitting
                        ? "Saving..."
                        : editingReviewId
                        ? "Save Changes"
                        : "Submit Rating & Review"}
                    </button>
                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="secondary-button py-2.5 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Community Reviews List */}
            <h2 className="mt-12 text-2xl font-bold">All User Reviews & Ratings</h2>
            <div className="mt-4 space-y-4">
              {data.reviews.map((review) => {
                const canManage =
                  user && (user.id === review.userId || user.role === "admin");
                return (
                  <article
                    className="rounded-xl border border-white/10 bg-white/5 p-5"
                    key={review.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-sm font-bold text-yellow-400">
                          ★ {review.rating} / 5
                        </span>
                        <strong className="text-lg">{review.title}</strong>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {canManage && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleStartEdit(review)}
                              className="rounded px-2 py-1 text-xs font-semibold text-blue-400 hover:bg-white/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="rounded px-2 py-1 text-xs font-semibold text-red-400 hover:bg-white/10"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-slate-300">{review.body}</p>
                  </article>
                );
              })}
              {!data.reviews.length && (
                <p className="panel p-6 text-center text-slate-400">
                  No ratings or reviews yet for this car. Be the first to rate it!
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
