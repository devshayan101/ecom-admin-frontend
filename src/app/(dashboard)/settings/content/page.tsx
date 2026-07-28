"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, getApiError } from "@/lib/api-client";
import { useAuthContext } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, LayoutTemplate, Layers } from "lucide-react";

interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  bg: string;
  badge: string;
  badgeText: string;
  emoji: string;
  buttonText: string;
  category: string;
  active: boolean;
  sortOrder: number;
}

interface PromotionCard {
  id: string;
  tag: string;
  title: string;
  desc: string;
  btnText: string;
  category: string;
  bgClass: string;
  btnClass: string;
  emoji: string;
  active: boolean;
  sortOrder: number;
}

export default function ContentSettingsPage() {
  const { role } = useAuthContext();
  const isReadOnly = role === "viewer";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"slides" | "promos">("slides");

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [promotionCards, setPromotionCards] = useState<PromotionCard[]>([]);

  // Modal State for Slide Editing/Creation
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Modal State for Promo Editing/Creation
  const [editingPromo, setEditingPromo] = useState<PromotionCard | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>("/settings");
      if (res?.content) {
        setHeroSlides(res.content.heroSlides || []);
        setPromotionCards(res.content.promotionCards || []);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveAll = async () => {
    if (isReadOnly) return;
    try {
      setSaving(true);
      const payload = {
        heroSlides: heroSlides.map((s, idx) => ({ ...s, sortOrder: idx })),
        promotionCards: promotionCards.map((p, idx) => ({ ...p, sortOrder: idx })),
      };
      await apiPut("/settings/content", payload);
      toast.success("Homepage content settings saved successfully!");
      fetchSettings();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  // --- Hero Slides Actions ---
  const handleOpenSlideModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide({ ...slide });
    } else {
      setEditingSlide({
        id: `hero-${Date.now()}`,
        tag: "✦ Special Offer",
        title: "New Headline,",
        titleHighlight: "Highlight Text",
        subtitle: "Engaging description for your homepage banner slide.",
        bg: "linear-gradient(125deg, #0a1828 0%, #0f2444 50%, #1e3a6e 100%)",
        badge: "20%",
        badgeText: "Off",
        emoji: "✨",
        buttonText: "Shop Now",
        category: "skincare",
        active: true,
        sortOrder: heroSlides.length,
      });
    }
    setIsSlideModalOpen(true);
  };

  const handleSaveSlideModal = () => {
    if (!editingSlide) return;
    if (!editingSlide.title || !editingSlide.subtitle || !editingSlide.buttonText || !editingSlide.category) {
      toast.error("Please fill in all required slide fields.");
      return;
    }

    setHeroSlides((prev) => {
      const exists = prev.some((s) => s.id === editingSlide.id);
      if (exists) {
        return prev.map((s) => (s.id === editingSlide.id ? editingSlide : s));
      }
      return [...prev, editingSlide];
    });

    setIsSlideModalOpen(false);
    setEditingSlide(null);
  };

  const handleDeleteSlide = (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSlideActive = (id: string) => {
    setHeroSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroSlides.length) return;
    const updated = [...heroSlides];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setHeroSlides(updated);
  };

  // --- Promo Cards Actions ---
  const handleOpenPromoModal = (promo?: PromotionCard) => {
    if (promo) {
      setEditingPromo({ ...promo });
    } else {
      setEditingPromo({
        id: `promo-${Date.now()}`,
        tag: "FEATURED DEAL",
        title: "Featured Collection",
        desc: "Discover premium handpicked products",
        btnText: "Explore Now",
        category: "skincare",
        bgClass: "bg-gradient-to-br from-[#0c4a30] via-[#0f5c3c] to-[#062e1e]",
        btnClass: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
        emoji: "🌿",
        active: true,
        sortOrder: promotionCards.length,
      });
    }
    setIsPromoModalOpen(true);
  };

  const handleSavePromoModal = () => {
    if (!editingPromo) return;
    if (!editingPromo.title || !editingPromo.desc || !editingPromo.btnText || !editingPromo.category) {
      toast.error("Please fill in all required promotion card fields.");
      return;
    }

    setPromotionCards((prev) => {
      const exists = prev.some((p) => p.id === editingPromo.id);
      if (exists) {
        return prev.map((p) => (p.id === editingPromo.id ? editingPromo : p));
      }
      return [...prev, editingPromo];
    });

    setIsPromoModalOpen(false);
    setEditingPromo(null);
  };

  const handleDeletePromo = (id: string) => {
    setPromotionCards((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTogglePromoActive = (id: string) => {
    setPromotionCards((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleMovePromo = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= promotionCards.length) return;
    const updated = [...promotionCards];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setPromotionCards(updated);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Homepage Content</h1>
          <p className="text-sm text-muted-foreground">
            Manage the hero banner slides and promotion grid cards displayed on your storefront homepage.
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={handleSaveAll} disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("slides")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "slides"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutTemplate className="h-4 w-4" />
          Hero Carousel ({heroSlides.length})
        </button>
        <button
          onClick={() => setActiveTab("promos")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "promos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          Promotion Cards ({promotionCards.length})
        </button>
      </div>

      {/* Hero Slides Tab */}
      {activeTab === "slides" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Hero Carousel Slides</h2>
            {!isReadOnly && (
              <Button onClick={() => handleOpenSlideModal()} variant="secondary" className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Add Slide
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                style={{ background: slide.bg }}
                className={`rounded-xl p-5 text-white shadow-md relative flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  !slide.active ? "opacity-40 border-2 border-dashed border-red-400" : ""
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 font-bold">
                      {slide.tag || "No Tag"}
                    </span>
                    {slide.badge && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-400 text-slate-900">
                        {slide.badge} {slide.badgeText}
                      </span>
                    )}
                    <span className="text-xl">{slide.emoji}</span>
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug">
                    {slide.title} <span className="text-amber-300">{slide.titleHighlight}</span>
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1">{slide.subtitle}</p>
                  <div className="pt-2 text-xs font-semibold text-amber-200 flex items-center gap-2">
                    <span>Button: "{slide.buttonText}"</span>
                    <span>•</span>
                    <span>Category: "{slide.category}"</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg backdrop-blur-sm self-start md:self-center">
                  <button
                    onClick={() => handleMoveSlide(idx, "up")}
                    disabled={idx === 0 || isReadOnly}
                    className="p-1 hover:bg-white/20 rounded disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSlide(idx, "down")}
                    disabled={idx === heroSlides.length - 1 || isReadOnly}
                    className="p-1 hover:bg-white/20 rounded disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleSlideActive(slide.id)}
                    disabled={isReadOnly}
                    className="p-1 hover:bg-white/20 rounded cursor-pointer"
                    title={slide.active ? "Hide Slide" : "Show Slide"}
                  >
                    {slide.active ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                  </button>
                  <button
                    onClick={() => handleOpenSlideModal(slide)}
                    disabled={isReadOnly}
                    className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    disabled={isReadOnly}
                    className="p-1 hover:bg-red-500/40 rounded text-red-300 cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {heroSlides.length === 0 && (
              <p className="text-center py-8 text-sm text-muted-foreground">
                No hero carousel slides added yet.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Promotion Cards Tab */}
      {activeTab === "promos" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Promotion Grid Cards</h2>
            {!isReadOnly && (
              <Button onClick={() => handleOpenPromoModal()} variant="secondary" className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Add Promo Card
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotionCards.map((promo, idx) => (
              <div
                key={promo.id}
                className={`${promo.bgClass || "bg-gradient-to-br from-[#0c4a30] via-[#0f5c3c] to-[#062e1e]"} rounded-xl p-5 text-white shadow-md relative flex flex-col justify-between min-h-[160px] ${
                  !promo.active ? "opacity-40 border-2 border-dashed border-red-400" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold tracking-widest text-white/70">
                      {promo.tag}
                    </span>
                    <span className="text-3xl">{promo.emoji}</span>
                  </div>
                  <h3 className="font-heading text-lg font-extrabold leading-snug">{promo.title}</h3>
                  <p className="text-xs text-white/80 font-medium">{promo.desc}</p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/10 mt-3">
                  <span className="text-xs text-amber-200 font-semibold">
                    Category: {promo.category}
                  </span>
                  <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-lg backdrop-blur-sm">
                    <button
                      onClick={() => handleMovePromo(idx, "up")}
                      disabled={idx === 0 || isReadOnly}
                      className="p-1 hover:bg-white/20 rounded disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMovePromo(idx, "down")}
                      disabled={idx === promotionCards.length - 1 || isReadOnly}
                      className="p-1 hover:bg-white/20 rounded disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleTogglePromoActive(promo.id)}
                      disabled={isReadOnly}
                      className="p-1 hover:bg-white/20 rounded cursor-pointer"
                    >
                      {promo.active ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-red-400" />}
                    </button>
                    <button
                      onClick={() => handleOpenPromoModal(promo)}
                      disabled={isReadOnly}
                      className="px-2 py-0.5 text-xs bg-white/20 hover:bg-white/30 rounded font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      disabled={isReadOnly}
                      className="p-1 hover:bg-red-500/40 rounded text-red-300 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {promotionCards.length === 0 && (
              <div className="col-span-2 text-center py-8 text-sm text-muted-foreground">
                No promotion cards added yet.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Slide Modal */}
      {isSlideModalOpen && editingSlide && (
        <Modal
          isOpen={isSlideModalOpen}
          onClose={() => setIsSlideModalOpen(false)}
          title={editingSlide.id ? "Edit Hero Slide" : "Add Hero Slide"}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Tag Header"
              value={editingSlide.tag}
              onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
              placeholder="e.g. ✦ New Arrivals 2026"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Main Title"
                value={editingSlide.title}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                placeholder="e.g. Glowing Skin,"
              />
              <Input
                label="Title Highlight Text"
                value={editingSlide.titleHighlight}
                onChange={(e) => setEditingSlide({ ...editingSlide, titleHighlight: e.target.value })}
                placeholder="e.g. Confident You"
              />
            </div>
            <Input
              label="Subtitle / Description"
              value={editingSlide.subtitle}
              onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
              placeholder="e.g. Premium skincare — serums, moisturizers, SPF & more."
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Badge Value"
                value={editingSlide.badge}
                onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                placeholder="e.g. 50%"
              />
              <Input
                label="Badge Text"
                value={editingSlide.badgeText}
                onChange={(e) => setEditingSlide({ ...editingSlide, badgeText: e.target.value })}
                placeholder="e.g. Upto Off"
              />
              <Input
                label="Emoji Icon"
                value={editingSlide.emoji}
                onChange={(e) => setEditingSlide({ ...editingSlide, emoji: e.target.value })}
                placeholder="e.g. ✨"
              />
            </div>
            <Input
              label="Background CSS Style / Gradient"
              value={editingSlide.bg}
              onChange={(e) => setEditingSlide({ ...editingSlide, bg: e.target.value })}
              placeholder="e.g. linear-gradient(125deg, #0a1828 0%, #0f2444 50%, #1e3a6e 100%)"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Button Text"
                value={editingSlide.buttonText}
                onChange={(e) => setEditingSlide({ ...editingSlide, buttonText: e.target.value })}
                placeholder="e.g. Shop Skincare"
              />
              <Input
                label="Category Link / Slug"
                value={editingSlide.category}
                onChange={(e) => setEditingSlide({ ...editingSlide, category: e.target.value })}
                placeholder="e.g. skincare"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="slideActive"
                checked={editingSlide.active}
                onChange={(e) => setEditingSlide({ ...editingSlide, active: e.target.checked })}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="slideActive" className="text-sm font-medium">
                Active on storefront
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsSlideModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSlideModal}>Save Slide</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Promo Modal */}
      {isPromoModalOpen && editingPromo && (
        <Modal
          isOpen={isPromoModalOpen}
          onClose={() => setIsPromoModalOpen(false)}
          title={editingPromo.id ? "Edit Promotion Card" : "Add Promotion Card"}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Tag Header"
              value={editingPromo.tag}
              onChange={(e) => setEditingPromo({ ...editingPromo, tag: e.target.value })}
              placeholder="e.g. UP TO 50% OFF"
            />
            <Input
              label="Title"
              value={editingPromo.title}
              onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
              placeholder="e.g. Skincare & Beauty Deals"
            />
            <Input
              label="Description"
              value={editingPromo.desc}
              onChange={(e) => setEditingPromo({ ...editingPromo, desc: e.target.value })}
              placeholder="e.g. Serums, moisturizers, SPF & more"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Button Text"
                value={editingPromo.btnText}
                onChange={(e) => setEditingPromo({ ...editingPromo, btnText: e.target.value })}
                placeholder="e.g. Shop Skincare"
              />
              <Input
                label="Category Link / Slug"
                value={editingPromo.category}
                onChange={(e) => setEditingPromo({ ...editingPromo, category: e.target.value })}
                placeholder="e.g. skincare"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Background Tailwind / CSS Class"
                value={editingPromo.bgClass}
                onChange={(e) => setEditingPromo({ ...editingPromo, bgClass: e.target.value })}
                placeholder="e.g. bg-gradient-to-br from-[#0c4a30] via-[#0f5c3c] to-[#062e1e]"
              />
              <Input
                label="Emoji Icon"
                value={editingPromo.emoji}
                onChange={(e) => setEditingPromo({ ...editingPromo, emoji: e.target.value })}
                placeholder="e.g. 🌿"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="promoActive"
                checked={editingPromo.active}
                onChange={(e) => setEditingPromo({ ...editingPromo, active: e.target.checked })}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="promoActive" className="text-sm font-medium">
                Active on storefront
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsPromoModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePromoModal}>Save Card</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
