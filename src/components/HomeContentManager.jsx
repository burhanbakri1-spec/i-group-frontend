import React from "react";

const emptyOffer = {
  id: "",
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  image: "/images/products/product-placeholder.svg",
  ctaTextEn: "Shop now",
  ctaTextAr: "تسوق الآن",
  ctaLink: "products",
  displayOrder: 1,
  isActive: true,
};

function offerToForm(offer) {
  if (!offer) return emptyOffer;
  return {
    id: offer.id || "",
    titleEn: offer.title?.en || "",
    titleAr: offer.title?.ar || "",
    descriptionEn: offer.description?.en || "",
    descriptionAr: offer.description?.ar || "",
    image: offer.image || "/images/products/product-placeholder.svg",
    ctaTextEn: offer.ctaText?.en || "Shop now",
    ctaTextAr: offer.ctaText?.ar || "تسوق الآن",
    ctaLink: offer.ctaLink || "products",
    displayOrder: offer.displayOrder || 1,
    isActive: offer.isActive !== false,
  };
}

function formToOffer(form) {
  return {
    id: form.id || "",
    title: {
      en: form.titleEn,
      ar: form.titleAr,
    },
    description: {
      en: form.descriptionEn,
      ar: form.descriptionAr,
    },
    image: form.image,
    ctaText: {
      en: form.ctaTextEn,
      ar: form.ctaTextAr,
    },
    ctaLink: form.ctaLink,
    displayOrder: Number(form.displayOrder || 0),
    isActive: Boolean(form.isActive),
  };
}

function HomeContentManager({
  canDelete = false,
  language,
  offers = [],
  onDeleteOffer,
  onDeleteReview,
  onModerateReview,
  onSaveOffer,
  reviews = [],
  t,
}) {
  const [editingOffer, setEditingOffer] = React.useState(null);
  const [form, setForm] = React.useState(emptyOffer);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(offerToForm(editingOffer));
  }, [editingOffer]);

  function updateField(event) {
    const { checked, name, type, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function submitOffer(event) {
    event.preventDefault();
    setIsSaving(true);
    await onSaveOffer?.(formToOffer(form));
    setIsSaving(false);
    setEditingOffer(null);
    setForm(emptyOffer);
  }

  return (
    <section className="admin-section home-content-manager">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">{t("homeContent.eyebrow")}</p>
          <h2>{t("homeContent.title")}</h2>
        </div>
      </div>

      <form className="admin-form" onSubmit={submitOffer}>
        <h3>{editingOffer ? t("homeContent.editOffer") : t("homeContent.addOffer")}</h3>
        <label>
          {t("homeContent.titleEn")}
          <input name="titleEn" onChange={updateField} required value={form.titleEn} />
        </label>
        <label>
          {t("homeContent.titleAr")}
          <input name="titleAr" onChange={updateField} required value={form.titleAr} />
        </label>
        <label>
          {t("homeContent.descriptionEn")}
          <textarea name="descriptionEn" onChange={updateField} value={form.descriptionEn} />
        </label>
        <label>
          {t("homeContent.descriptionAr")}
          <textarea name="descriptionAr" onChange={updateField} value={form.descriptionAr} />
        </label>
        <label>
          {t("homeContent.image")}
          <input name="image" onChange={updateField} value={form.image} />
        </label>
        <label>
          {t("homeContent.ctaTextEn")}
          <input name="ctaTextEn" onChange={updateField} value={form.ctaTextEn} />
        </label>
        <label>
          {t("homeContent.ctaTextAr")}
          <input name="ctaTextAr" onChange={updateField} value={form.ctaTextAr} />
        </label>
        <label>
          {t("homeContent.ctaLink")}
          <input name="ctaLink" onChange={updateField} value={form.ctaLink} />
        </label>
        <label>
          {t("homeContent.displayOrder")}
          <input name="displayOrder" onChange={updateField} type="number" value={form.displayOrder} />
        </label>
        <label className="checkbox-field">
          <input checked={form.isActive} name="isActive" onChange={updateField} type="checkbox" />
          {t("homeContent.isActive")}
        </label>
        <div className="form-actions full-field">
          <button className="primary-action" disabled={isSaving} type="submit">
            {isSaving ? t("common.temporaryContent") : t("admin.save")}
          </button>
          <button className="secondary-action" onClick={() => setEditingOffer(null)} type="button">
            {t("admin.cancel")}
          </button>
        </div>
      </form>

      <div className="content-admin-list">
        {offers.map((offer) => (
          <article className="content-admin-card" key={offer.id}>
            <img alt={offer.title?.[language] || offer.title?.en} src={offer.image} />
            <div>
              <strong>{offer.title?.[language] || offer.title?.en}</strong>
              <span>{offer.isActive ? t("homeContent.active") : t("homeContent.hidden")}</span>
            </div>
            <button className="text-action" onClick={() => setEditingOffer(offer)} type="button">
              {t("admin.editProduct")}
            </button>
            {canDelete && (
              <button className="text-action danger" onClick={() => onDeleteOffer?.(offer.id)} type="button">
                {t("admin.delete")}
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="reviews-admin-panel">
        <h3>{t("reviews.manageTitle")}</h3>
        {reviews.length === 0 ? (
          <p>{t("reviews.noReviews")}</p>
        ) : (
          reviews.map((review) => (
            <article className="review-mini-row" key={review.id}>
              <div className="review-moderation-head">
                <strong>{review.customerName}</strong>
                <span>{review.type === "employee" ? t("reviews.employeeReview") : t("reviews.storeReview")}</span>
              </div>
              <span className="review-stars-inline">{"?".repeat(Number(review.rating || 0))}</span>
              <p>{review.comment?.[language] || review.comment?.en || review.comment}</p>
              {review.employeeName && <small>{review.employeeName}</small>}
              {review.orderId && <small>{review.orderId}</small>}
              <small>
                {review.status === "rejected"
                  ? t("reviews.rejected")
                  : review.status === "approved"
                    ? t("reviews.approved")
                    : t("reviews.pending")}
                {" / "}
                {review.isActive ? t("homeContent.active") : t("homeContent.hidden")}
              </small>
              {onModerateReview && (
                <div className="review-moderation-actions">
                  <button className="secondary-action" onClick={() => onModerateReview(review.id, "approved", true)} type="button">
                    {t("reviews.approve")}
                  </button>
                  <button className="secondary-action" onClick={() => onModerateReview(review.id, "approved", false)} type="button">
                    {t("reviews.hide")}
                  </button>
                  <button className="secondary-action" onClick={() => onModerateReview(review.id, "approved", true)} type="button">
                    {t("reviews.show")}
                  </button>
                  <button className="secondary-action" onClick={() => onModerateReview(review.id, "rejected", false)} type="button">
                    {t("reviews.reject")}
                  </button>
                  {canDelete && (
                    <button className="text-action danger" onClick={() => onDeleteReview?.(review.id)} type="button">
                      {t("admin.delete")}
                    </button>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default HomeContentManager;
