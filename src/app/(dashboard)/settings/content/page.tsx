"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet, apiPut, getApiError } from "@/lib/api-client";
import { useAuthContext } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, LayoutTemplate, Layers, Video, Play, Sparkles } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import MediaUpload from "@/components/MediaUpload";

interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  bg: string;
  largeImage?: string;
  smallImage?: string;
  badge: string;
  badgeText: string;
  emoji: string;
  buttonText: string;
  category: string;
  active: boolean;
  sortOrder: number;
  titleColor?: string;
  titleHighlightColor?: string;
  subtitleColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
}

interface PromotionCard {
  id: string;
  tag: string;
  title: string;
  desc: string;
  btnText: string;
  category: string;
  image?: string;
  bgClass: string;
  btnClass: string;
  emoji: string;
  active: boolean;
  sortOrder: number;
  titleColor?: string;
  descColor?: string;
  btnTextColor?: string;
  btnBgColor?: string;
}

interface ProductVideo {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnail: string;
  views?: string;
  likes?: number;
  duration?: string;
  productId?: string;
  active: boolean;
  sortOrder: number;
}

export default function ContentSettingsPage() {
  const { role } = useAuthContext();
  const isReadOnly = role === "viewer";
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"slides" | "promos" | "shorts">("slides");

  useEffect(() => {
    if (tabParam === "shorts") {
      setActiveTab("shorts");
    } else if (tabParam === "promos") {
      setActiveTab("promos");
    }
  }, [tabParam]);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [promotionCards, setPromotionCards] = useState<PromotionCard[]>([]);
  const [productVideos, setProductVideos] = useState<ProductVideo[]>([]);
  const [productsList, setProductsList] = useState<{ _id: string; name: string }[]>([]);

  // Modal State for Slide Editing/Creation
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Modal State for Promo Editing/Creation
  const [editingPromo, setEditingPromo] = useState<PromotionCard | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Modal State for Video Shorts Editing/Creation
  const [editingVideo, setEditingVideo] = useState<ProductVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>("/settings");
      if (res?.content) {
        setHeroSlides(res.content.heroSlides || []);
        setPromotionCards(res.content.promotionCards || []);
        setProductVideos(res.content.productVideos || []);
      }
      
      // Fetch products for linking
      try {
        const prodRes = await apiGet<any>("/products?limit=100");
        if (prodRes?.products) {
          setProductsList(prodRes.products.map((p: any) => ({ _id: p._id, name: p.name })));
        }
      } catch (err) {
        // Silently catch if products fail
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
        productVideos: productVideos.map((v, idx) => ({ ...v, sortOrder: idx })),
      };
      try {
        await apiPut("/settings/content", payload);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await apiPut("/settings/general", { content: payload });
        } else {
          throw err;
        }
      }
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
        titleColor: "#ffffff",
        titleHighlightColor: "#fcd34d",
        subtitleColor: "#e2e8f0",
        buttonTextColor: "#000000",
        buttonBgColor: "#ffd814",
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
        titleColor: "#ffffff",
        descColor: "#e2e8f0",
        btnTextColor: "#ffffff",
        btnBgColor: "#0058be",
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

  // --- Product Videos / Shorts Actions ---
  const handleOpenVideoModal = (video?: ProductVideo) => {
    if (video) {
      setEditingVideo({ ...video });
    } else {
      setEditingVideo({
        id: `vid-${Date.now()}`,
        title: "Product Feature Showcase",
        category: "skincare",
        videoUrl: "",
        thumbnail: "",
        views: "1.5K",
        likes: 150,
        duration: "0:15",
        productId: productsList[0]?._id || "",
        active: true,
        sortOrder: productVideos.length,
      });
    }
    setIsVideoModalOpen(true);
  };

  const handleSaveVideoModal = () => {
    if (!editingVideo) return;
    if (!editingVideo.title || !editingVideo.videoUrl || !editingVideo.thumbnail || !editingVideo.category) {
      toast.error("Please provide title, category, video, and thumbnail.");
      return;
    }

    setProductVideos((prev) => {
      const exists = prev.some((v) => v.id === editingVideo.id);
      if (exists) {
        return prev.map((v) => (v.id === editingVideo.id ? editingVideo : v));
      }
      return [...prev, editingVideo];
    });

    setIsVideoModalOpen(false);
    setEditingVideo(null);
  };

  const handleDeleteVideo = (id: string) => {
    setProductVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleToggleVideoActive = (id: string) => {
    setProductVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
    );
  };

  const handleMoveVideo = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= productVideos.length) return;
    const updated = [...productVideos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setProductVideos(updated);
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
            Manage hero banners, promotion cards, and trending product video shorts displayed on storefront.
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
        <button
          onClick={() => setActiveTab("shorts")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "shorts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Video className="h-4 w-4" />
          Product Shorts ({productVideos.length})
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

      {/* Product Video Shorts Tab */}
      {activeTab === "shorts" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Trending Product Shorts
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage vertical product video reels, thumbnail images, and linked shop products.
              </p>
            </div>
            {!isReadOnly && (
              <Button onClick={() => handleOpenVideoModal()} variant="secondary" className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Add Video Short
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productVideos.map((vid, idx) => (
              <div
                key={vid.id}
                className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative flex flex-col justify-between ${
                  !vid.active ? "opacity-40 border-2 border-dashed border-red-500" : ""
                }`}
              >
                {/* Thumbnail / Video Preview Header */}
                <div className="relative aspect-[16/9] bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={vid.thumbnail || "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop"}
                    alt={vid.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {vid.category}
                  </span>
                  {vid.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-slate-300 px-1.5 py-0.5 rounded font-mono">
                      {vid.duration}
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">{vid.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>👁️ {vid.views || "1K"} views</span>
                      <span>❤️ {vid.likes || 0} likes</span>
                    </div>
                  </div>

                  {vid.productId && (
                    <div className="bg-slate-800/80 p-2 rounded-lg text-[11px] text-slate-300 flex items-center justify-between border border-slate-700">
                      <span className="truncate">Linked Product:</span>
                      <span className="font-semibold text-blue-400 truncate max-w-[120px]">
                        {productsList.find((p) => p._id === vid.productId)?.name || vid.productId}
                      </span>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-800 mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveVideo(idx, "up")}
                        disabled={idx === 0 || isReadOnly}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Left/Up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveVideo(idx, "down")}
                        disabled={idx === productVideos.length - 1 || isReadOnly}
                        className="p-1 hover:bg-slate-800 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Right/Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleVideoActive(vid.id)}
                        disabled={isReadOnly}
                        className="p-1 hover:bg-slate-800 rounded cursor-pointer"
                        title={vid.active ? "Deactivate" : "Activate"}
                      >
                        {vid.active ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                      </button>
                      <button
                        onClick={() => handleOpenVideoModal(vid)}
                        disabled={isReadOnly}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(vid.id)}
                        disabled={isReadOnly}
                        className="p-1 hover:bg-red-500/30 rounded text-red-400 cursor-pointer"
                        title="Delete Short"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {productVideos.length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                No product videos added yet. Click "Add Video Short" to get started.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-border py-3 my-2">
              <ImageUpload
                label="Large Screen Image (Desktop) - Rec: 1920x560 px"
                endpoint="/settings/content/upload-url"
                value={editingSlide.largeImage}
                onChange={(url) => setEditingSlide({ ...editingSlide, largeImage: url })}
                onRemove={() => setEditingSlide({ ...editingSlide, largeImage: "" })}
              />
              <ImageUpload
                label="Small Screen Image (Mobile) - Rec: 768x480 px"
                endpoint="/settings/content/upload-url"
                value={editingSlide.smallImage}
                onChange={(url) => setEditingSlide({ ...editingSlide, smallImage: url })}
                onRemove={() => setEditingSlide({ ...editingSlide, smallImage: "" })}
              />
            </div>
            <Input
              label="Background CSS Style / Gradient (Fallback if no image)"
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
            <div className="border-t border-b border-border py-3 my-2">
              <ImageUpload
                label="Promotion Card Image - Rec: 600x800 px"
                endpoint="/settings/content/upload-url"
                value={editingPromo.image}
                onChange={(url) => setEditingPromo({ ...editingPromo, image: url })}
                onRemove={() => setEditingPromo({ ...editingPromo, image: "" })}
              />
            </div>
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

      {/* Video Short Modal */}
      {isVideoModalOpen && editingVideo && (
        <Modal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          title={editingVideo.id ? "Edit Product Video Short" : "Add Product Video Short"}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <Input
              label="Video Title"
              value={editingVideo.title}
              onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
              placeholder="e.g. Vitamin C Serum Daily Glow Routine"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Category Slug"
                value={editingVideo.category}
                onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                placeholder="e.g. skincare, cosmetics, women"
              />
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-foreground">Linked Product</label>
                <select
                  value={editingVideo.productId || ""}
                  onChange={(e) => setEditingVideo({ ...editingVideo, productId: e.target.value })}
                  className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Linked Product --</option>
                  {productsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Video File Upload (CloudFront) */}
            <div className="space-y-2 border-t border-b border-border py-3">
              <MediaUpload
                label="Short Video File (MP4/WebM) - Upload to CloudFront"
                mediaType="video"
                endpoint="/settings/content/upload-url"
                value={editingVideo.videoUrl}
                onChange={(url) => setEditingVideo({ ...editingVideo, videoUrl: url })}
                onRemove={() => setEditingVideo({ ...editingVideo, videoUrl: "" })}
              />
              <Input
                label="Or Direct Video URL (MP4)"
                value={editingVideo.videoUrl}
                onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                placeholder="https://cloudfront.net/my-video.mp4"
              />
            </div>

            {/* Thumbnail Poster Image (CloudFront) */}
            <div className="space-y-2 border-b border-border pb-3">
              <MediaUpload
                label="Poster Thumbnail Image - Upload to CloudFront"
                mediaType="image"
                endpoint="/settings/content/upload-url"
                value={editingVideo.thumbnail}
                onChange={(url) => setEditingVideo({ ...editingVideo, thumbnail: url })}
                onRemove={() => setEditingVideo({ ...editingVideo, thumbnail: "" })}
              />
              <Input
                label="Or Direct Thumbnail Image URL"
                value={editingVideo.thumbnail}
                onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Views Tag"
                value={editingVideo.views || ""}
                onChange={(e) => setEditingVideo({ ...editingVideo, views: e.target.value })}
                placeholder="e.g. 12.4K"
              />
              <Input
                label="Initial Likes"
                type="number"
                value={editingVideo.likes || 0}
                onChange={(e) => setEditingVideo({ ...editingVideo, likes: Number(e.target.value) })}
                placeholder="843"
              />
              <Input
                label="Duration"
                value={editingVideo.duration || ""}
                onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                placeholder="0:15"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="videoActive"
                checked={editingVideo.active}
                onChange={(e) => setEditingVideo({ ...editingVideo, active: e.target.checked })}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="videoActive" className="text-sm font-medium">
                Active on storefront homepage
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsVideoModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveVideoModal}>Save Video Short</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
