"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const tokenKey = "icareDropshipperSession";
async function request(path: string, init: RequestInit = {}) {
  const token = sessionStorage.getItem(tokenKey) || "";
  const response = await fetch(`/api/icare/dropshipping${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed.");
  return body.data;
}
const cash = (v: unknown) =>
  Number(v || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const text = (v: any) =>
  typeof v === "object" ? v?.ar || v?.en || "" : String(v || "");

export function Shell({ children }: { children: React.ReactNode }) {
  const links = [
    ["dashboard", "الرئيسية"],
    ["products", "المنتجات"],
    ["orders", "الطلبات"],
    ["wallet", "المحفظة"],
    ["withdrawals", "السحوبات"],
    ["profile", "الملف"],
  ];
  return (
    <section className="ds-shell" dir="rtl">
      <header>
        <b>iCare · Dropshipping</b>
        <nav>
          {links.map(([p, l]) => (
            <Link key={p} href={`/icare/dropshipping/${p}`}>
              {l}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => {
            sessionStorage.removeItem(tokenKey);
            location.href = "/icare/dropshipping/login";
          }}
        >
          خروج
        </button>
      </header>
      {children}
    </section>
  );
}
function Auth({ mode }: { mode: "register" | "login" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      let data;
      if (mode === "register") {
        data = await request("/register", {
          method: "POST",
          body: JSON.stringify({
            fullName: f.get("name"),
            email: f.get("email"),
            phone: f.get("phone"),
            password: f.get("password"),
            region: f.get("region"),
            address: f.get("address"),
            socialMediaAccounts: { instagram: f.get("instagram") },
          }),
        });
      } else {
        const response = await fetch("/api/icare/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: f.get("email"),
            password: f.get("password"),
          }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message);
        data = { token: body.data.accessToken };
      }
      sessionStorage.setItem(tokenKey, String(data.token));
      const status = await request("/account-status");
      location.href =
        status.status === "approved"
          ? "/icare/dropshipping/dashboard"
          : "/icare/dropshipping/pending";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="ds-auth">
      <div>
        <p>iCare Dropshipping</p>
        <h1>{mode === "register" ? "التسجيل كمسوق" : "دخول المسوقين"}</h1>
        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <Field n="name" l="الاسم الكامل" />
              <Field n="phone" l="الهاتف" />
              <Field n="region" l="المنطقة" />
              <Field n="address" l="العنوان" />
              <Field n="instagram" l="إنستغرام" optional />
            </>
          )}
          <Field n="email" l="البريد الإلكتروني" type="email" />
          <Field n="password" l="كلمة المرور" type="password" />
          {error && <p className="ds-error">{error}</p>}
          <button disabled={busy}>
            {busy
              ? "جارٍ التنفيذ…"
              : mode === "register"
                ? "إنشاء الحساب"
                : "دخول"}
          </button>
        </form>
        <Link
          href={`/icare/dropshipping/${mode === "register" ? "login" : "register"}`}
        >
          {mode === "register" ? "لديك حساب؟" : "إنشاء حساب مسوق"}
        </Link>
      </div>
    </main>
  );
}
function Field({
  n,
  l,
  type = "text",
  optional = false,
}: {
  n: string;
  l: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <label>
      {l}
      <input
        name={n}
        type={type}
        required={!optional}
        minLength={n === "password" ? 8 : undefined}
      />
    </label>
  );
}
export const Register = () => <Auth mode="register" />;
export const Login = () => <Auth mode="login" />;
function useData(path: string) {
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    request(path)
      .then(setData)
      .catch((e) => {
        setError(e.message);
        if (/Authentication|profile not found/i.test(e.message))
          setTimeout(() => (location.href = "/icare/dropshipping/login"), 500);
      });
  }, [path, tick]);
  return { data, error, reload: () => setTick((v) => v + 1) };
}
function State({ error }: { error?: string }) {
  return (
    <main className="ds-main">
      <div className={error ? "ds-error" : "ds-card"}>
        {error || "جارٍ التحميل…"}
      </div>
    </main>
  );
}
export function Status() {
  const { data, error } = useData("/account-status");
  if (!data || error) return <State error={error} />;
  const msg: any = {
    pending: "طلبك قيد المراجعة",
    approved: "تمت الموافقة على حسابك",
    rejected: `تم رفض الطلب: ${data.rejection_reason || ""}`,
    suspended: `الحساب موقوف: ${data.suspension_reason || ""}`,
  };
  return (
    <main className="ds-auth">
      <div>
        <h1>{msg[data.status]}</h1>
        <p className={`ds-status ${data.status}`}>{data.status}</p>
        {data.status === "approved" && (
          <Link className="ds-primary" href="/icare/dropshipping/dashboard">
            فتح البوابة
          </Link>
        )}
      </div>
    </main>
  );
}
export function Dashboard() {
  const { data, error } = useData("/dashboard");
  if (!data || error) return <State error={error} />;
  return (
    <main className="ds-main">
      <h1>لوحة المسوق</h1>
      <Cards
        values={[
          ["الرصيد المتاح", data.available_balance],
          ["أرباح معلقة", data.pending_balance],
          ["مدفوع", data.paid_balance],
          ["طلبات مسلمة", data.delivered_orders],
          ["مبيعات الشهر", data.monthly_sales],
          ["ربح الشهر", data.monthly_profit],
        ]}
      />
    </main>
  );
}
function Cards({ values }: { values: any[][] }) {
  return (
    <div className="ds-metrics">
      {values.map(([l, v]) => (
        <article key={l}>
          <span>{l}</span>
          <strong>{cash(v)}</strong>
        </article>
      ))}
    </div>
  );
}
export function Products() {
  const { data, error } = useData("/products");
  if (!data || error) return <State error={error} />;
  return (
    <main className="ds-main">
      <h1>منتجات الدروبشيبينغ</h1>
      <div className="ds-products">
        {data.length ? (
          data.map((p: any) => (
            <article key={p.id}>
              <img src={p.image || p.primaryImage || "/logo.svg"} alt="" />
              <h2>{text(p.name)}</h2>
              <p>سعر الدروبشيبينغ: {cash(p.dropshipping.dropshipping_price)}</p>
              <p>
                السعر المقترح: {cash(p.dropshipping.suggested_selling_price)}
              </p>
              <Link href={`/icare/dropshipping/products/${p.id}`}>
                التفاصيل والمواد التسويقية
              </Link>
            </article>
          ))
        ) : (
          <div className="ds-card">لا توجد منتجات متاحة.</div>
        )}
      </div>
    </main>
  );
}
export function Product({ id }: { id: string }) {
  const { data, error } = useData(`/products/${id}`);
  if (!data || error) return <State error={error} />;
  const caption =
    text(data.dropshipping.marketing_caption) || text(data.description);
  return (
    <main className="ds-main">
      <div className="ds-detail">
        <img src={data.image || data.primaryImage || "/logo.svg"} alt="" />
        <div>
          <h1>{text(data.name)}</h1>
          <p>{caption}</p>
          <p>المخزون: {data.dropshipping.available_stock ?? data.stockQty}</p>
          <p>
            سعر البيع: {cash(data.dropshipping.minimum_selling_price)} –{" "}
            {cash(data.dropshipping.maximum_selling_price)}
          </p>
          <div className="ds-actions">
            <button onClick={() => navigator.clipboard.writeText(caption)}>
              نسخ الوصف
            </button>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  (data.dropshipping.marketing_hashtags || []).join(" "),
                )
              }
            >
              نسخ الوسوم
            </button>
            {data.dropshipping.allow_media_download && data.image && (
              <a href={data.image} download>
                تحميل الصورة
              </a>
            )}
            {(data.dropshipping.media || []).map((media: any) => (
              <a key={media.id} href={media.public_url} download={media.downloadable}>
                {media.media_type === "video" ? "تحميل الفيديو" : media.media_type === "zip" ? "تحميل الحزمة" : "تحميل مادة تسويقية"}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
function Table({ rows, fields }: { rows: any[]; fields: string[] }) {
  return rows.length ? (
    <div className="ds-table">
      <table>
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f}>{f.replaceAll("_", " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i}>
              {fields.map((f) => (
                <td key={f}>{String(r[f] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="ds-card">لا توجد بيانات.</div>
  );
}
export function Orders() {
  const { data, error } = useData("/orders");
  if (!data || error) return <State error={error} />;
  return (
    <main className="ds-main">
      <div className="ds-title">
        <h1>طلباتي</h1>
        <Link className="ds-primary" href="/icare/dropshipping/orders/new">
          طلب جديد
        </Link>
      </div>
      <Table
        rows={data}
        fields={[
          "id",
          "customer_name",
          "region",
          "customer_selling_total",
          "marketer_profit",
          "delivery_status",
          "created_at",
        ]}
      />
    </main>
  );
}
export function Order({ id }: { id: string }) {
  const { data, error } = useData(`/orders/${id}`);
  if (!data || error) return <State error={error} />;
  return (
    <main className="ds-main">
      <h1>تفاصيل الطلب</h1>
      <Table
        rows={[data]}
        fields={[
          "customer_name",
          "customer_phone",
          "region",
          "delivery_address",
          "customer_selling_total",
          "fees_total",
          "marketer_profit",
          "delivery_status",
          "profit_status",
        ]}
      />
    </main>
  );
}
export function NewOrder() {
  const products = useData("/products");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  if (!products.data || products.error) return <State error={products.error} />;
  const p = products.data.find((x: any) => String(x.id) === selected);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      const data = await request("/orders", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          customerName: f.get("customerName"),
          customerPhone: f.get("customerPhone"),
          customerSecondaryPhone: f.get("secondaryPhone"),
          deliveryAddress: f.get("address"),
          region: f.get("region"),
          notes: f.get("notes"),
          items: [
            {
              productId: f.get("productId"),
              variantId: f.get("variantId") || null,
              quantity: Number(f.get("quantity")),
              customerUnitPrice: f.get("price"),
            },
          ],
        }),
      });
      location.href = `/icare/dropshipping/orders/${data.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    }
  }
  return (
    <main className="ds-main">
      <h1>طلب جديد</h1>
      <form className="ds-form" onSubmit={submit}>
        <Field n="customerName" l="اسم العميل" />
        <Field n="customerPhone" l="هاتف العميل" />
        <Field n="secondaryPhone" l="هاتف إضافي" optional />
        <Field n="address" l="العنوان" />
        <Field n="region" l="المنطقة" />
        <label>
          المنتج
          <select
            name="productId"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required
          >
            <option value="">اختر</option>
            {products.data.map((x: any) => (
              <option key={x.id} value={x.id}>
                {text(x.name)}
              </option>
            ))}
          </select>
        </label>
        {p?.variants?.length > 0 && (
          <label>
            الخيار
            <select name="variantId">
              <option value="">بدون</option>
              {p.variants.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.sku || text(v.name)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          الكمية
          <input name="quantity" type="number" min="1" required />
        </label>
        <label>
          سعر البيع
          <input
            name="price"
            type="number"
            step="0.01"
            min={p?.dropshipping.minimum_selling_price || 0}
            max={p?.dropshipping.maximum_selling_price || undefined}
            required
          />
        </label>
        <Field n="notes" l="ملاحظات" optional />
        {error && <p className="ds-error">{error}</p>}
        <button>إنشاء الطلب</button>
      </form>
    </main>
  );
}
export function Wallet() {
  const w = useData("/wallet"),
    t = useData("/transactions");
  if (!w.data || !t.data || w.error || t.error)
    return <State error={w.error || t.error} />;
  return (
    <main className="ds-main">
      <h1>المحفظة</h1>
      <Cards
        values={[
          ["متاح", w.data.available_balance],
          ["معلق", w.data.pending_balance],
          ["محجوز", w.data.withdrawal_reserved],
          ["التزامات المرتجعة", w.data.debt_balance],
          ["مدفوع", w.data.paid_balance],
          ["إجمالي الأرباح", w.data.lifetime_earnings],
        ]}
      />
      <Table
        rows={t.data}
        fields={["transaction_type", "amount", "description", "created_at"]}
      />
    </main>
  );
}
export function Withdrawals() {
  const { data, error, reload } = useData("/withdrawals");
  const [formError, setFormError] = useState("");
  if (!data || error) return <State error={error} />;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await request("/withdrawals", {
        method: "POST",
        body: JSON.stringify({
          amount: f.get("amount"),
          paymentMethod: f.get("method"),
          paymentDetails: { account: f.get("account") },
        }),
      });
      e.currentTarget.reset();
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed.");
    }
  }
  return (
    <main className="ds-main">
      <h1>السحوبات</h1>
      <form className="ds-inline" onSubmit={submit}>
        <input
          name="amount"
          type="number"
          step=".01"
          placeholder="المبلغ"
          required
        />
        <select name="method">
          <option value="bank_transfer">تحويل بنكي</option>
          <option value="wallet">محفظة</option>
        </select>
        <input name="account" placeholder="تفاصيل الدفع" required />
        <button>طلب سحب</button>
      </form>
      {formError && <p className="ds-error">{formError}</p>}
      <Table
        rows={data}
        fields={[
          "amount",
          "payment_method",
          "status",
          "requested_at",
          "reference_number",
        ]}
      />
    </main>
  );
}
export function Profile() {
  const { data, error, reload } = useData("/profile");
  if (!data || error) return <State error={error} />;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await request("/profile", {
      method: "PATCH",
      body: JSON.stringify({
        fullName: f.get("name"),
        region: f.get("region"),
        address: f.get("address"),
        socialMediaAccounts: { instagram: f.get("instagram") },
      }),
    });
    reload();
  }
  return (
    <main className="ds-main">
      <h1>الملف الشخصي</h1>
      <form className="ds-form" onSubmit={submit}>
        <Field n="name" l="الاسم" />
        <Field n="region" l="المنطقة" />
        <Field n="address" l="العنوان" />
        <Field n="instagram" l="إنستغرام" optional />
        <button>حفظ</button>
      </form>
    </main>
  );
}
