import React from "react";
import { ImageOff, ImagePlus, Save, Trash2, Upload } from "lucide-react";
import { uploadImage } from "../utils/api.js";

const emptyItem = {
  id: "",
  sectionKey: "",
  sectionLabel: "",
  groupKey: "sections",
  imageUrl: "",
  title: "",
  subtitle: "",
  linkUrl: "",
  sortOrder: 0,
  isActive: true,
};

function groupItems(items) {
  return items.reduce((groups, item) => {
    const sectionKey = item.sectionKey || "";
    const key =
      sectionKey.startsWith("homepage_category_")
        ? "homepage_categories"
        : /promo|banner|homepage_split/.test(sectionKey)
          ? "ads"
          : item.groupKey || "sections";
    groups[key] = [...(groups[key] || []), item];
    return groups;
  }, {});
}

const groupLabels = {
  homepage: { en: "Homepage Sections", ar: "أقسام الصفحة الرئيسية" },
  homepage_categories: { en: "Homepage Cards", ar: "بطاقات الصفحة الرئيسية" },
  about: { en: "Static Sections - About", ar: "الأقسام الثابتة - من نحن" },
  cleanups: { en: "Static Sections - Cleanups", ar: "الأقسام الثابتة - حملات التنظيف" },
  cleanups_gallery: { en: "Cleanups Gallery", ar: "معرض حملات التنظيف" },
  cleanups_tabs: { en: "Cleanups Tabs", ar: "تبويبات حملات التنظيف" },
  eb_points: { en: "Static Sections - EB Points", ar: "الأقسام الثابتة - نقاط EB" },
  how_it_works: { en: "Static Sections - How It Works", ar: "الأقسام الثابتة - كيف يعمل" },
  ads: { en: "Ads / Banners", ar: "الإعلانات والبنرات" },
  sections: { en: "Other Static Website Images", ar: "صور الموقع الثابتة الأخرى" },
};

function MediaEditor({ item, language, onDelete, onSave }) {
  const [draft, setDraft] = React.useState(item);
  const [message, setMessage] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const isArabic = language === "ar";

  React.useEffect(() => setDraft(item), [item]);

  function update(name, value) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploading(true);
      setMessage("");
      const result = await uploadImage(file);
      update("imageUrl", result.url || result.path || "");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!draft.sectionKey.trim()) {
      setMessage(isArabic ? "أدخل مفتاح القسم." : "Section key is required.");
      return;
    }
    try {
      setMessage("");
      await onSave({ ...draft, sortOrder: Number(draft.sortOrder || 0) });
      setMessage(isArabic ? "تم حفظ الصورة." : "Image saved.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <article className="website-media-card">
      <div className="website-media-preview">
        {draft.imageUrl ? (
          <img alt={draft.sectionLabel || draft.sectionKey} src={draft.imageUrl} />
        ) : (
          <ImagePlus aria-hidden="true" size={30} />
        )}
        <span>{draft.isActive ? (isArabic ? "نشطة" : "Active") : (isArabic ? "مخفية" : "Hidden")}</span>
      </div>

      <div className="website-media-fields">
        <label>
          {isArabic ? "اسم القسم" : "Section label"}
          <input value={draft.sectionLabel} onChange={(event) => update("sectionLabel", event.target.value)} />
        </label>
        <label>
          {isArabic ? "مفتاح القسم" : "Section key"}
          <input value={draft.sectionKey} onChange={(event) => update("sectionKey", event.target.value)} />
        </label>
        <label className="full-field">
          {isArabic ? "رابط الصورة" : "Image URL"}
          <input value={draft.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} />
        </label>
        <label>
          {isArabic ? "المجموعة" : "Group"}
          <input value={draft.groupKey} onChange={(event) => update("groupKey", event.target.value)} />
        </label>
        <label>
          {isArabic ? "الترتيب" : "Sort order"}
          <input type="number" value={draft.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} />
        </label>
        <label>
          {isArabic ? "العنوان الاختياري" : "Optional title"}
          <input value={draft.title} onChange={(event) => update("title", event.target.value)} />
        </label>
        <label>
          {isArabic ? "الوصف الاختياري" : "Optional subtitle"}
          <input value={draft.subtitle} onChange={(event) => update("subtitle", event.target.value)} />
        </label>
        <label>
          {isArabic ? "الرابط الاختياري" : "Optional link"}
          <input value={draft.linkUrl} onChange={(event) => update("linkUrl", event.target.value)} />
        </label>
        <label className="website-media-toggle">
          <input
            checked={draft.isActive !== false}
            onChange={(event) => update("isActive", event.target.checked)}
            type="checkbox"
          />
          {isArabic ? "إظهار الصورة في الموقع" : "Show image on website"}
        </label>
      </div>

      <div className="website-media-actions">
        <label className="admin-upload-button">
          <Upload size={15} />
          {uploading ? (isArabic ? "جاري الرفع..." : "Uploading...") : (isArabic ? "رفع صورة" : "Upload image")}
          <input accept="image/*" disabled={uploading} hidden onChange={handleUpload} type="file" />
        </label>
        <button
          className="website-media-clear"
          disabled={!draft.imageUrl}
          onClick={() => {
            update("imageUrl", "");
            setMessage(isArabic ? "تم مسح الرابط. اضغط حفظ لاستخدام الصورة الافتراضية." : "Image URL cleared. Save to use the default fallback.");
          }}
          type="button"
        >
          <ImageOff size={15} />
          {isArabic ? "مسح الصورة" : "Clear image"}
        </button>
        <button className="admin-primary-button" onClick={handleSave} type="button">
          <Save size={15} />
          {isArabic ? "حفظ" : "Save"}
        </button>
        {draft.id && (
          <button className="website-media-delete" onClick={() => onDelete(draft.id)} type="button">
            <Trash2 size={15} />
            {isArabic ? "حذف" : "Delete"}
          </button>
        )}
      </div>
      {message && <p className="website-media-message">{message}</p>}
    </article>
  );
}

function WebsiteMediaManager({ language = "en", items = [], onDelete, onSave }) {
  const [drafts, setDrafts] = React.useState([]);
  const isArabic = language === "ar";
  const grouped = groupItems([...items, ...drafts].sort(
    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
  ));

  function addDraft() {
    setDrafts((current) => [
      ...current,
      { ...emptyItem, _draftKey: `draft-${Date.now()}`, sortOrder: items.length + current.length + 1 },
    ]);
  }

  async function saveItem(item) {
    const { _draftKey, ...payload } = item;
    const saved = await onSave(payload);
    if (item._draftKey) {
      setDrafts((current) => current.filter((draft) => draft._draftKey !== item._draftKey));
    }
    return saved;
  }

  return (
    <section className="website-media-manager">
      <header className="website-media-head">
        <div>
          <h2>{isArabic ? "صور الموقع" : "Website Media"}</h2>
          <p>
            {isArabic
              ? "غيّر صور أقسام الموقع الثابتة بدون تعديل صور المنتجات."
              : "Manage static section images without changing product media."}
          </p>
        </div>
        <button className="admin-primary-button" onClick={addDraft} type="button">
          <ImagePlus size={16} />
          {isArabic ? "إضافة صورة" : "Add image"}
        </button>
      </header>

      {Object.entries(grouped).map(([group, groupEntries]) => (
        <section className="website-media-group" key={group}>
          <h3>{groupLabels[group]?.[language] || group.replaceAll("_", " ")}</h3>
          <div className="website-media-grid">
            {groupEntries.map((item) => (
              <MediaEditor
                item={item}
                key={item.id || item._draftKey}
                language={language}
                onDelete={onDelete}
                onSave={saveItem}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

export default WebsiteMediaManager;
