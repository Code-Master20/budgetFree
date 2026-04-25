import { motion as Motion } from "framer-motion";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import API from "../api";
import LoadingScreen from "../components/LoadingScreen";
import OtpVerificationCard from "../components/OtpVerificationCard";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";
import { fetchUser } from "../redux/authSlice";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({ status }) {
  const toneClass =
    status === "approved" || status === "sent"
      ? "bg-emerald-100/90 text-emerald-800"
      : status === "rejected"
        ? "bg-rose-100/90 text-rose-800"
        : "bg-amber-100/90 text-amber-800";

  return <span className={`pill ${toneClass}`}>{status}</span>;
}

function SummaryCard({ label, value, note, delay = 0 }) {
  return (
    <Motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-panel-strong rounded-[28px] p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 break-words text-3xl font-semibold text-slate-900">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </Motion.article>
  );
}

function SectionCard({ title, subtitle, children, badge }) {
  return (
    <section className="glass-panel rounded-[34px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="section-copy mt-2">{subtitle}</p>
        </div>
        {badge ? <div>{badge}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const initialProductForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  affiliateLink: "",
  images: "",
  features: "",
  pros: "",
  cons: "",
  rating: "",
};

function normalizeList(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToMultiline(items) {
  return Array.isArray(items) ? items.join("\n") : "";
}

export default function AdminPanel() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [adminOtpCode, setAdminOtpCode] = useState("");
  const [adminOtpMessage, setAdminOtpMessage] = useState("");
  const [sendingAdminOtp, setSendingAdminOtp] = useState(false);
  const [verifyingAdminOtp, setVerifyingAdminOtp] = useState(false);
  const [data, setData] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [amazonImportUrl, setAmazonImportUrl] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [creatingOrUpdatingProduct, setCreatingOrUpdatingProduct] =
    useState(false);
  const [importingAmazonProduct, setImportingAmazonProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");
  const [reviewActionId, setReviewActionId] = useState("");
  const [rejectReasons, setRejectReasons] = useState({});
  const [sendingRewardId, setSendingRewardId] = useState("");
  const [giftCardLinks, setGiftCardLinks] = useState({});
  const hasAdminOtpVerification = Boolean(user?.otpVerification?.adminAccess);

  const handleAdminOtpRequired = async () => {
    setStatus("otp_required");
    setError("Verify the email OTP to continue using admin tools.");
    setSuccessMessage("");
    await dispatch(fetchUser());
  };

  const loadDashboard = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setStatus("loading");
      }

      setError("");
      const response = await API.get("/admin/dashboard");
      setData(response.data);
      setStatus("ready");
    } catch (fetchError) {
      if (fetchError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(
        fetchError.response?.data?.message || "Unable to load admin dashboard",
      );
      setStatus("error");
    }
  };

  const loadAllReviews = async () => {
    try {
      const response = await API.get("/reviews/admin/all");
      setAllReviews(response.data || []);
    } catch (fetchError) {
      if (fetchError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(
        fetchError.response?.data?.message || "Unable to load review moderation",
      );
    }
  };

  const loadDashboardEvent = useEffectEvent(loadDashboard);
  const loadAllReviewsEvent = useEffectEvent(loadAllReviews);

  useEffect(() => {
    if (!hasAdminOtpVerification) {
      return;
    }

    const bootstrap = async () => {
      await Promise.all([loadDashboardEvent(), loadAllReviewsEvent()]);
    };

    bootstrap();
  }, [hasAdminOtpVerification]);

  const summaryCards = useMemo(() => {
    if (!data?.overview) {
      return [];
    }

    const { overview } = data;

    return [
      {
        label: "Users",
        value: overview.totalUsers,
        note: `${overview.verifiedUsers} verified accounts and ${overview.totalAdmins} admins.`,
      },
      {
        label: "Products",
        value: overview.totalProducts,
        note: "Create, update, or remove products from this panel.",
      },
      {
        label: "Reviews",
        value: overview.totalReviews,
        note: `${overview.pendingReviews} pending and ${overview.approvedReviews} approved reviews.`,
      },
      {
        label: "Reward requests",
        value: overview.totalRewardRequests,
        note: `${overview.pendingRewardRequests} requests still waiting to be fulfilled.`,
      },
      {
        label: "User wallet balance",
        value: formatCurrency(overview.totalWalletBalance),
        note: "Combined wallet balance across member accounts.",
      },
      {
        label: "User points",
        value: overview.totalPoints,
        note: "Total points currently sitting across all accounts.",
      },
    ];
  }, [data]);

  const pendingReviews = useMemo(
    () => allReviews.filter((review) => review.status === "pending"),
    [allReviews],
  );

  const handleProductFormChange = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setEditingProductId(null);
  };

  const handleCreateOrUpdateProduct = async (event) => {
    event.preventDefault();

    try {
      setCreatingOrUpdatingProduct(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        category: productForm.category.trim(),
        price: Number(productForm.price || 0),
        affiliateLink: productForm.affiliateLink.trim(),
        images: normalizeList(productForm.images),
        features: normalizeList(productForm.features),
        pros: normalizeList(productForm.pros),
        cons: normalizeList(productForm.cons),
        rating: Number(productForm.rating || 0),
      };

      if (editingProductId) {
        await API.put(`/products/${editingProductId}`, payload);
        setSuccessMessage("Product updated successfully.");
      } else {
        await API.post("/products", payload);
        setSuccessMessage("Product added successfully.");
      }

      resetProductForm();
      await loadDashboard({ showLoader: false });
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(actionError.response?.data?.message || "Unable to save product");
    } finally {
      setCreatingOrUpdatingProduct(false);
    }
  };

  const handleImportAmazonProduct = async (event) => {
    event.preventDefault();

    try {
      setImportingAmazonProduct(true);
      setError("");
      setSuccessMessage("");

      const response = await API.post("/products/import/amazon", {
        affiliateLink: amazonImportUrl.trim(),
      });
      const importedProduct = response.data?.product;

      if (importedProduct) {
        setEditingProductId(importedProduct._id || null);
        setProductForm({
          title: importedProduct.title || "",
          description: importedProduct.description || "",
          category: importedProduct.category || "",
          price: importedProduct.price ?? "",
          affiliateLink: importedProduct.affiliateLink || "",
          images: listToMultiline(importedProduct.images),
          features: listToMultiline(importedProduct.features),
          pros: listToMultiline(importedProduct.pros),
          cons: listToMultiline(importedProduct.cons),
          rating: importedProduct.rating ?? "",
        });
      }

      setAmazonImportUrl("");
      setSuccessMessage(
        response.data?.message || "Amazon product imported successfully.",
      );

      if (importedProduct?._id) {
        await loadDashboard({ showLoader: false });
      }
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(
        actionError.response?.data?.message || "Unable to import Amazon product",
      );
    } finally {
      setImportingAmazonProduct(false);
    }
  };

  const handleEditProduct = async (productId) => {
    try {
      setError("");
      setSuccessMessage("");
      const response = await API.get(`/products/${productId}`);
      const product = response.data;

      setEditingProductId(productId);
      setProductForm({
        title: product.title || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price ?? "",
        affiliateLink: product.affiliateLink || "",
        images: listToMultiline(product.images),
        features: listToMultiline(product.features),
        pros: listToMultiline(product.pros),
        cons: listToMultiline(product.cons),
        rating: product.rating ?? "",
      });
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(actionError.response?.data?.message || "Unable to load product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Delete this product? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProductId(productId);
      setError("");
      setSuccessMessage("");
      await API.delete(`/products/${productId}`);

      if (editingProductId === productId) {
        resetProductForm();
      }

      setSuccessMessage("Product removed successfully.");
      await loadDashboard({ showLoader: false });
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(
        actionError.response?.data?.message || "Unable to remove product",
      );
    } finally {
      setDeletingProductId("");
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      setReviewActionId(reviewId);
      setError("");
      setSuccessMessage("");
      await API.patch("/reviews/approve", { reviewId });
      setSuccessMessage("Review approved successfully.");
      await Promise.all([loadAllReviews(), loadDashboard({ showLoader: false })]);
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(
        actionError.response?.data?.message || "Unable to approve review",
      );
    } finally {
      setReviewActionId("");
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      setReviewActionId(reviewId);
      setError("");
      setSuccessMessage("");
      await API.delete("/reviews/admin/reject", {
        data: {
          reviewId,
          rejectionReason: rejectReasons[reviewId] || "",
        },
      });
      setSuccessMessage("Review rejected successfully.");
      setRejectReasons((current) => ({
        ...current,
        [reviewId]: "",
      }));
      await Promise.all([loadAllReviews(), loadDashboard({ showLoader: false })]);
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(
        actionError.response?.data?.message || "Unable to reject review",
      );
    } finally {
      setReviewActionId("");
    }
  };

  const handleSendGiftCard = async (rewardId) => {
    try {
      setSendingRewardId(rewardId);
      setError("");
      setSuccessMessage("");
      await API.patch("/rewards/send", {
        rewardId,
        giftCardLink: giftCardLinks[rewardId] || "",
      });
      setSuccessMessage("Gift card sent successfully.");
      setGiftCardLinks((current) => ({
        ...current,
        [rewardId]: "",
      }));
      await loadDashboard({ showLoader: false });
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        await handleAdminOtpRequired();
        return;
      }

      setError(
        actionError.response?.data?.message || "Unable to send gift card",
      );
    } finally {
      setSendingRewardId("");
    }
  };

  const handleSendAdminOtp = async () => {
    try {
      setSendingAdminOtp(true);
      setError("");
      setAdminOtpMessage("");
      await API.post("/auth/otp/request", { purpose: "admin_access" });
      setAdminOtpMessage("A 6-digit OTP was sent to your email.");
    } catch (actionError) {
      setError(actionError.response?.data?.message || "Unable to send admin OTP");
    } finally {
      setSendingAdminOtp(false);
    }
  };

  const handleVerifyAdminOtp = async () => {
    try {
      setVerifyingAdminOtp(true);
      setError("");
      setAdminOtpMessage("");
      await API.post("/auth/otp/verify", {
        purpose: "admin_access",
        code: adminOtpCode.trim(),
      });
      setAdminOtpCode("");
      setAdminOtpMessage("Admin OTP verified. Loading your control room...");
      await dispatch(fetchUser());
    } catch (actionError) {
      setError(actionError.response?.data?.message || "Unable to verify admin OTP");
    } finally {
      setVerifyingAdminOtp(false);
    }
  };

  if (!hasAdminOtpVerification) {
    return (
      <PageTransition className="page-wrap">
        <SiteChrome>
          <div className="app-shell space-y-6">
            <section className="glass-panel rounded-[34px] p-6 sm:p-8">
              <span className="eyebrow">Admin security check</span>
              <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
                Verify an OTP before opening admin tools.
              </h1>
              <p className="section-copy mt-4 max-w-2xl">
                To protect product, review, and reward operations, admin access now
                requires a short-lived OTP sent to your verified email.
              </p>
            </section>

            {error ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <OtpVerificationCard
              title="Admin OTP required"
              description="Send a code to your email, enter the 6-digit OTP, and we will unlock admin access for a limited time."
              code={adminOtpCode}
              onCodeChange={setAdminOtpCode}
              message={adminOtpMessage}
              onSend={handleSendAdminOtp}
              onVerify={handleVerifyAdminOtp}
              sending={sendingAdminOtp}
              verifying={verifyingAdminOtp}
              sendLabel="Send admin OTP"
              verifyLabel="Verify and continue"
            />
          </div>
        </SiteChrome>
      </PageTransition>
    );
  }

  if (status === "loading") {
    return <LoadingScreen label="Loading admin dashboard..." />;
  }

  if (status === "error") {
    return (
      <PageTransition className="page-wrap">
        <SiteChrome>
          <div className="app-shell">
            <div className="glass-panel mx-auto max-w-2xl rounded-[32px] px-6 py-8 text-center">
              <h1 className="text-3xl font-semibold">Admin panel unavailable</h1>
              <p className="section-copy mt-3">{error}</p>
              <Link className="primary-button mt-6" to="/">
                Back to home
              </Link>
            </div>
          </div>
        </SiteChrome>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell space-y-6">
          <Motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel overflow-hidden rounded-[34px] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Admin control room</span>
                <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
                  Manage products, reviews, rewards, and platform activity.
                </h1>
                <p className="section-copy mt-4 max-w-2xl">
                  This admin panel now exposes the backend-defined admin actions,
                  so you can operate the store directly from one screen.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="primary-button" to="/dashboard">
                  Open member dashboard
                </Link>
                <Link className="secondary-button" to="/products">
                  Open products page
                </Link>
              </div>
            </div>
          </Motion.section>

          {successMessage ? (
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card, index) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                note={card.note}
                delay={index * 0.05}
              />
            ))}
          </section>

          <SectionCard
            title={editingProductId ? "Edit product" : "Add product"}
            subtitle="Create a product, load an existing one into the form, update it, or remove it from the recent product list below."
            badge={
              <span className="pill bg-emerald-100/90 text-emerald-800">
                Product management
              </span>
            }
          >
            <div className="space-y-6">
              <form
                onSubmit={handleImportAmazonProduct}
                className="rounded-[24px] bg-white/72 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-medium text-slate-600">
                      Amazon affiliate link
                    </span>
                    <input
                      required
                      value={amazonImportUrl}
                      onChange={(event) => setAmazonImportUrl(event.target.value)}
                      className="field"
                      placeholder="https://www.amazon.in/dp/..."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={importingAmazonProduct}
                    className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {importingAmazonProduct
                      ? "Importing from Amazon..."
                      : "Import from Amazon"}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  This fills title, image, features, listed price, and sales-rank
                  context from Amazon&apos;s API. If API access is not configured,
                  we will still load a draft from the affiliate link so you can
                  complete the product manually.
                </p>
              </form>

              <form onSubmit={handleCreateOrUpdateProduct} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Product title
                  </span>
                  <input
                    required
                    name="title"
                    value={productForm.title}
                    onChange={handleProductFormChange}
                    className="field"
                    placeholder="Product name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Category
                  </span>
                  <input
                    required
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    className="field"
                    placeholder="Category"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Description
                </span>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  className="field min-h-28"
                  placeholder="Short product description"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Price
                  </span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    className="field"
                    placeholder="0"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Rating
                  </span>
                  <input
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={productForm.rating}
                    onChange={handleProductFormChange}
                    className="field"
                    placeholder="4.5"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Affiliate link
                  </span>
                  <input
                    required
                    name="affiliateLink"
                    value={productForm.affiliateLink}
                    onChange={handleProductFormChange}
                    className="field"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Image URLs
                  </span>
                  <textarea
                    name="images"
                    value={productForm.images}
                    onChange={handleProductFormChange}
                    className="field min-h-28"
                    placeholder="One image URL per line"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Features
                  </span>
                  <textarea
                    name="features"
                    value={productForm.features}
                    onChange={handleProductFormChange}
                    className="field min-h-28"
                    placeholder="One feature per line"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Pros
                  </span>
                  <textarea
                    name="pros"
                    value={productForm.pros}
                    onChange={handleProductFormChange}
                    className="field min-h-28"
                    placeholder="One pro per line"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Cons
                  </span>
                  <textarea
                    name="cons"
                    value={productForm.cons}
                    onChange={handleProductFormChange}
                    className="field min-h-28"
                    placeholder="One con per line"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={creatingOrUpdatingProduct}
                  className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingOrUpdatingProduct
                    ? editingProductId
                      ? "Updating product..."
                      : "Adding product..."
                    : editingProductId
                      ? "Update product"
                      : "Add product"}
                </button>

                {editingProductId ? (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="secondary-button"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
              </form>
            </div>
          </SectionCard>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Recent products"
              subtitle="Edit or remove recently added products."
              badge={
                <span className="pill bg-slate-100/90 text-slate-700">
                  {(data?.recentProducts || []).length} items
                </span>
              }
            >
              <div className="space-y-3">
                {(data?.recentProducts || []).length ? (
                  data.recentProducts.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          {product.title}
                        </p>
                        <span className="pill">{product.category}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Price: {formatCurrency(product.price)}</span>
                        <span>Rating: {Number(product.rating || 0).toFixed(1)}</span>
                        <span>Added: {formatDate(product.createdAt)}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product._id)}
                          className="secondary-button px-4 py-2 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deletingProductId === product._id}
                          className="secondary-button px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingProductId === product._id
                            ? "Removing..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm text-slate-600">
                    No products available yet.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Recent users"
              subtitle="Latest registrations and account verification status."
              badge={
                <span className="pill bg-slate-100/90 text-slate-700">
                  {(data?.recentUsers || []).length} users
                </span>
              }
            >
              <div className="space-y-3">
                {(data?.recentUsers || []).length ? (
                  data.recentUsers.map((user) => (
                    <div
                      key={user._id}
                      className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="pill bg-slate-100/90 text-slate-700">
                            {user.role}
                          </span>
                          <span
                            className={`pill ${
                              user.isVerified
                                ? "bg-emerald-100/90 text-emerald-800"
                                : "bg-rose-100/90 text-rose-800"
                            }`}
                          >
                            {user.isVerified ? "verified" : "unverified"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2">{user.email}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Points: {user.points || 0}</span>
                        <span>Wallet: {formatCurrency(user.walletBalance)}</span>
                        <span>Joined: {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm text-slate-600">
                    No users found.
                  </div>
                )}
              </div>
            </SectionCard>
          </section>

          <SectionCard
            title="Review moderation"
            subtitle="Approve or reject reviews using the admin review routes already defined in the backend."
            badge={
              <div className="flex flex-wrap gap-2">
                <span className="pill bg-amber-100/90 text-amber-800">
                  Pending {pendingReviews.length}
                </span>
                <span className="pill bg-slate-100/90 text-slate-700">
                  Total {allReviews.length}
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              {allReviews.length ? (
                allReviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-[26px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {review.productId?.title || "Unknown product"}
                        </p>
                        <p className="mt-1">
                          By {review.userId?.name || "Unknown user"} (
                          {review.userId?.email || "No email"})
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>Rating: {review.rating}/5</span>
                          <span>Submitted: {formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                      <StatusPill status={review.status} />
                    </div>

                    {review.image ? (
                      <img
                        src={review.image}
                        alt="Review proof"
                        className="mt-4 h-48 w-full rounded-[22px] object-cover sm:w-72"
                      />
                    ) : null}

                    <p className="mt-4 leading-6">
                      {review.reviewText || "No review text submitted."}
                    </p>

                    {review.status === "rejected" && review.rejectionReason ? (
                      <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                        Rejection reason: {review.rejectionReason}
                      </div>
                    ) : null}

                    {review.status !== "approved" ? (
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={rejectReasons[review._id] || review.rejectionReason || ""}
                          onChange={(event) =>
                            setRejectReasons((current) => ({
                              ...current,
                              [review._id]: event.target.value,
                            }))
                          }
                          className="field min-h-24"
                          placeholder="Reason for rejection"
                        />
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleApproveReview(review._id)}
                            disabled={reviewActionId === review._id}
                            className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {reviewActionId === review._id
                              ? "Saving..."
                              : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectReview(review._id)}
                            disabled={reviewActionId === review._id}
                            className="secondary-button disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {reviewActionId === review._id
                              ? "Saving..."
                              : "Reject"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm text-slate-600">
                  No reviews available.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Reward requests"
            subtitle="Send Amazon gift card links from the admin reward route."
            badge={
              <span className="pill bg-slate-100/90 text-slate-700">
                {(data?.recentRewardRequests || []).length} requests
              </span>
            }
          >
            <div className="space-y-4">
              {(data?.recentRewardRequests || []).length ? (
                data.recentRewardRequests.map((reward) => (
                  <div
                    key={reward._id}
                    className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">
                        {reward.userId?.name || "Unknown user"}
                      </p>
                      <StatusPill status={reward.status} />
                    </div>
                    <p className="mt-2">{reward.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Amount: {formatCurrency(reward.rewardAmount)}</span>
                      <span>Requested: {formatDate(reward.createdAt)}</span>
                    </div>

                    {reward.status === "pending" ? (
                      <div className="mt-4 space-y-3">
                        <input
                          value={giftCardLinks[reward._id] || ""}
                          onChange={(event) =>
                            setGiftCardLinks((current) => ({
                              ...current,
                              [reward._id]: event.target.value,
                            }))
                          }
                          className="field"
                          placeholder="Gift card link"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendGiftCard(reward._id)}
                          disabled={sendingRewardId === reward._id}
                          className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {sendingRewardId === reward._id
                            ? "Sending..."
                            : "Send gift card"}
                        </button>
                      </div>
                    ) : reward.giftCardLink ? (
                      <a
                        href={reward.giftCardLink}
                        target="_blank"
                        rel="noreferrer"
                        className="primary-button mt-4"
                      >
                        Open sent gift card
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm text-slate-600">
                  No reward requests available.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
