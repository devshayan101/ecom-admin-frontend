'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Trash2, Plus, HelpCircle } from 'lucide-react';
import type { ProductKeyValue, ProductFaq, ProductDisplayConfig } from '@/lib/types';

interface ProductDescriptionSectionsProps {
  displayConfigs?: ProductDisplayConfig;
  topHighlights?: ProductKeyValue[];
  aboutThisItem?: string[];
  additionalInformation?: ProductKeyValue[];
  styleDetails?: ProductKeyValue[];
  featuresSpecs?: ProductKeyValue[];
  faqs?: ProductFaq[];
  onChange: (fields: {
    display_configs?: ProductDisplayConfig;
    top_highlights?: ProductKeyValue[];
    about_this_item?: string[];
    additional_information?: ProductKeyValue[];
    style_details?: ProductKeyValue[];
    features_specs?: ProductKeyValue[];
    faqs?: ProductFaq[];
  }) => void;
}

export default function ProductDescriptionSections({
  displayConfigs = {
    top_highlights: true,
    about_this_item: true,
    additional_information: true,
    style_details: true,
    features_specs: true,
    faqs: true,
  },
  topHighlights = [],
  aboutThisItem = [],
  additionalInformation = [],
  styleDetails = [],
  featuresSpecs = [],
  faqs = [],
  onChange,
}: ProductDescriptionSectionsProps) {

  const handleConfigChange = (key: keyof ProductDisplayConfig, val: boolean) => {
    onChange({
      display_configs: {
        ...displayConfigs,
        [key]: val,
      },
    });
  };

  // Key-value list helper functions
  const updateKeyValueItem = (
    list: ProductKeyValue[],
    index: number,
    field: 'key' | 'value',
    val: string,
    listName: 'top_highlights' | 'additional_information' | 'style_details' | 'features_specs'
  ) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ [listName]: updated });
  };

  const addKeyValueItem = (
    list: ProductKeyValue[],
    listName: 'top_highlights' | 'additional_information' | 'style_details' | 'features_specs'
  ) => {
    onChange({ [listName]: [...list, { key: '', value: '' }] });
  };

  const removeKeyValueItem = (
    list: ProductKeyValue[],
    index: number,
    listName: 'top_highlights' | 'additional_information' | 'style_details' | 'features_specs'
  ) => {
    onChange({ [listName]: list.filter((_, idx) => idx !== index) });
  };

  // Bullet points helper functions
  const updateBulletItem = (index: number, val: string) => {
    const updated = [...aboutThisItem];
    updated[index] = val;
    onChange({ about_this_item: updated });
  };

  const addBulletItem = () => {
    onChange({ about_this_item: [...aboutThisItem, ''] });
  };

  const removeBulletItem = (index: number) => {
    onChange({ about_this_item: aboutThisItem.filter((_, idx) => idx !== index) });
  };

  // FAQ helper functions
  const updateFaqItem = (index: number, field: 'question' | 'answer', val: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ faqs: updated });
  };

  const addFaqItem = () => {
    onChange({ faqs: [...faqs, { question: '', answer: '' }] });
  };

  const removeFaqItem = (index: number) => {
    onChange({ faqs: faqs.filter((_, idx) => idx !== index) });
  };

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="border-b border-border/50 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Detailed Product Description Sections</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure, manage, and toggle visibility of special descriptive grids, bullet points, and Q&A on OlinBuy storefront.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        
        {/* Toggle Switches */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            Section Display Toggles
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-muted/20 p-4 rounded-xl border border-border/40 text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!displayConfigs.top_highlights}
                onChange={(e) => handleConfigChange('top_highlights', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-foreground">Top Highlights</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!displayConfigs.about_this_item}
                onChange={(e) => handleConfigChange('about_this_item', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-foreground">About This Item</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!displayConfigs.additional_information}
                onChange={(e) => handleConfigChange('additional_information', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-foreground">Additional Info</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!displayConfigs.style_details}
                onChange={(e) => handleConfigChange('style_details', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-foreground">Style Details</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!displayConfigs.features_specs}
                onChange={(e) => handleConfigChange('features_specs', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-foreground">Features & Specs</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!displayConfigs.faqs}
                onChange={(e) => handleConfigChange('faqs', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-foreground">Product FAQs</span>
            </label>
          </div>
        </div>

        {/* 1. Top Highlights (Key-Value Grid) */}
        {displayConfigs.top_highlights && (
          <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-bold text-foreground">Top Highlights</h5>
                <p className="text-[11px] text-muted-foreground">Appears above-the-fold as an invisible grid (e.g. Fit type, Collar style).</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => addKeyValueItem(topHighlights, 'top_highlights')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </Button>
            </div>
            {topHighlights.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No highlights added yet.</p>
            ) : (
              <div className="space-y-2">
                {topHighlights.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g. Fit type"
                      value={item.key}
                      onChange={(e) => updateKeyValueItem(topHighlights, idx, 'key', e.target.value, 'top_highlights')}
                      className="flex-1"
                    />
                    <Input
                      placeholder="e.g. Regular Fit"
                      value={item.value}
                      onChange={(e) => updateKeyValueItem(topHighlights, idx, 'value', e.target.value, 'top_highlights')}
                      className="flex-1"
                    />
                    <button type="button" onClick={() => removeKeyValueItem(topHighlights, idx, 'top_highlights')} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. About This Item (Bullet Points) */}
        {displayConfigs.about_this_item && (
          <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-bold text-foreground">About This Item</h5>
                <p className="text-[11px] text-muted-foreground">Scannable features list displayed in clean bullet points.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addBulletItem}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Bullet
              </Button>
            </div>
            {aboutThisItem.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No bullet points added yet.</p>
            ) : (
              <div className="space-y-2">
                {aboutThisItem.map((bullet, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g. 【Premium Material】 Made of 100% breathable organic cotton..."
                      value={bullet}
                      onChange={(e) => updateBulletItem(idx, e.target.value)}
                      className="flex-1"
                    />
                    <button type="button" onClick={() => removeBulletItem(idx)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Style Details (Key-Value Grid) */}
        {displayConfigs.style_details && (
          <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-bold text-foreground">Style Details</h5>
                <p className="text-[11px] text-muted-foreground">Displays style configurations (e.g. Rise style, Pattern, Leg style).</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => addKeyValueItem(styleDetails, 'style_details')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </Button>
            </div>
            {styleDetails.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No style attributes added yet.</p>
            ) : (
              <div className="space-y-2">
                {styleDetails.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g. Pattern"
                      value={item.key}
                      onChange={(e) => updateKeyValueItem(styleDetails, idx, 'key', e.target.value, 'style_details')}
                      className="flex-1"
                    />
                    <Input
                      placeholder="e.g. Solid Color"
                      value={item.value}
                      onChange={(e) => updateKeyValueItem(styleDetails, idx, 'value', e.target.value, 'style_details')}
                      className="flex-1"
                    />
                    <button type="button" onClick={() => removeKeyValueItem(styleDetails, idx, 'style_details')} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Features & Specs (Key-Value Grid) */}
        {displayConfigs.features_specs && (
          <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-[#ff6b00]/30">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-bold text-foreground">Features & Specs</h5>
                <p className="text-[11px] text-muted-foreground">Technical specs & structural features table.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => addKeyValueItem(featuresSpecs, 'features_specs')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </Button>
            </div>
            {featuresSpecs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No technical specs added yet.</p>
            ) : (
              <div className="space-y-2">
                {featuresSpecs.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g. Water Resistance"
                      value={item.key}
                      onChange={(e) => updateKeyValueItem(featuresSpecs, idx, 'key', e.target.value, 'features_specs')}
                      className="flex-1"
                    />
                    <Input
                      placeholder="e.g. Not Water Resistant"
                      value={item.value}
                      onChange={(e) => updateKeyValueItem(featuresSpecs, idx, 'value', e.target.value, 'features_specs')}
                      className="flex-1"
                    />
                    <button type="button" onClick={() => removeKeyValueItem(featuresSpecs, idx, 'features_specs')} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Additional Information (Key-Value Grid) */}
        {displayConfigs.additional_information && (
          <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-bold text-foreground">Additional Information</h5>
                <p className="text-[11px] text-muted-foreground">Details like manufacturer, net quantity, box dimensions, item weight, packer.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => addKeyValueItem(additionalInformation, 'additional_information')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </Button>
            </div>
            {additionalInformation.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No additional info rows added yet.</p>
            ) : (
              <div className="space-y-2">
                {additionalInformation.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g. Manufacturer"
                      value={item.key}
                      onChange={(e) => updateKeyValueItem(additionalInformation, idx, 'key', e.target.value, 'additional_information')}
                      className="flex-1"
                    />
                    <Input
                      placeholder="e.g. Nakalank Fashion"
                      value={item.value}
                      onChange={(e) => updateKeyValueItem(additionalInformation, idx, 'value', e.target.value, 'additional_information')}
                      className="flex-1"
                    />
                    <button type="button" onClick={() => removeKeyValueItem(additionalInformation, idx, 'additional_information')} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Product FAQs (Q&A) */}
        {displayConfigs.faqs && (
          <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-sm font-bold text-foreground">Product FAQs (Q&A)</h5>
                <p className="text-[11px] text-muted-foreground">Product-specific Frequently Asked Questions displayed on storefront.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addFaqItem}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ Item
              </Button>
            </div>
            {faqs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No custom FAQs added yet. The FAQ section will be hidden on storefront.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-lg border border-border/60 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted-foreground">FAQ #{idx + 1}</span>
                      <button type="button" onClick={() => removeFaqItem(idx)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      label="Question"
                      placeholder="e.g. Is this item machine washable?"
                      value={faq.question}
                      onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Answer</label>
                      <textarea
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-foreground placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Yes, machine wash cold with like colors."
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
