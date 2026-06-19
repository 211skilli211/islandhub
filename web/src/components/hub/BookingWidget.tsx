'use client';

import React, { useState, useMemo } from 'react';
import { PriceTag, RatingBadge, AvailabilityBadge, UrgencyCue } from './SharedComponents';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BookingWidgetType = 'date-range' | 'date-time' | 'quote' | 'ticket' | 'donation' | 'cart' | 'calendar';

interface BookingWidgetProps {
  type: BookingWidgetType;
  /** Price per unit (per night, per person, per day, etc.) */
  pricePerUnit?: number;
  /** Unit label: /night, /person, /day, etc. */
  unitLabel?: string;
  /** Minimum quantity */
  minQuantity?: number;
  /** Maximum quantity */
  maxQuantity?: number;
  /** Available dates (ISO strings) for date pickers */
  availableDates?: string[];
  /** Available time slots */
  timeSlots?: string[];
  /** Ticket types with prices */
  ticketTypes?: { name: string; price: number; available: number }[];
  /** Donation preset amounts */
  donationAmounts?: number[];
  /** Item name for cart mode */
  itemName?: string;
  /** Item image for cart mode */
  itemImage?: string;
  /** Rating to display */
  rating?: number | string;
  reviewCount?: number;
  /** Urgency message */
  urgency?: { type: 'scarcity' | 'time' | 'demand' | 'trending'; value: string };
  /** Free cancellation text */
  cancellationText?: string;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA disabled */
  ctaDisabled?: boolean;
  /** On CTA click */
  onCtaClick?: () => void;
  /** Service list for calendar mode */
  services?: { name: string; price: number; duration: string }[];
  /** Selected service index for calendar mode */
  selectedService?: number;
  onServiceChange?: (index: number) => void;
  /** ClassName */
  className?: string;
}

// ─── Date Picker (simple) ────────────────────────────────────────────────────

function SimpleDateInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-primary text-sm text-ink-primary focus:outline-none focus:border-accent-500 transition-colors"
      />
    </div>
  );
}

// ─── Quantity Selector ───────────────────────────────────────────────────────

function QuantitySelector({ value, min, max, onChange, label }: {
  value: number; min: number; max: number; onChange: (v: number) => void; label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-ink-secondary">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-border-primary flex items-center justify-center text-ink-secondary hover:border-accent-500 hover:text-accent-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="text-sm font-bold text-ink-primary w-6 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-border-primary flex items-center justify-center text-ink-secondary hover:border-accent-500 hover:text-accent-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Main Widget ─────────────────────────────────────────────────────────────

export default function BookingWidget({
  type,
  pricePerUnit = 0,
  unitLabel = '/night',
  minQuantity = 1,
  maxQuantity = 10,
  availableDates,
  timeSlots,
  ticketTypes,
  donationAmounts = [10, 25, 50, 100, 250],
  itemName,
  itemImage,
  rating,
  reviewCount,
  urgency,
  cancellationText,
  ctaLabel,
  ctaDisabled = false,
  onCtaClick,
  services,
  selectedService = 0,
  onServiceChange,
  className = '',
}: BookingWidgetProps) {
  // State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [donationAmount, setDonationAmount] = useState(donationAmounts[1] || 25);
  const [customDonation, setCustomDonation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [cartQty, setCartQty] = useState(1);

  // Calculations
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const diff = Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
    return diff;
  }, [checkIn, checkOut]);

  const total = useMemo(() => {
    switch (type) {
      case 'date-range': return pricePerUnit * nights * (guests > 0 ? 1 : 1);
      case 'date-time': return pricePerUnit * quantity;
      case 'ticket': return (ticketTypes?.[selectedTicket]?.price || pricePerUnit) * quantity;
      case 'donation': return parseFloat(customDonation) || donationAmount;
      case 'cart': return pricePerUnit * cartQty;
      case 'calendar': return services?.[selectedService]?.price || pricePerUnit;
      case 'quote': return 0;
      default: return pricePerUnit * quantity;
    }
  }, [type, pricePerUnit, nights, guests, quantity, ticketTypes, selectedTicket, donationAmount, customDonation, cartQty, services, selectedService]);

  const serviceFee = total > 0 ? total * 0.05 : 0;
  const grandTotal = total + serviceFee;

  // CTA label
  const defaultCtaLabel = useMemo(() => {
    switch (type) {
      case 'date-range': return `Reserve - $${grandTotal.toFixed(0)} total`;
      case 'date-time': return `Book Now - $${grandTotal.toFixed(0)} total`;
      case 'ticket': return `Get Tickets - $${grandTotal.toFixed(0)} total`;
      case 'donation': return `Contribute $${grandTotal.toFixed(0)}`;
      case 'cart': return `Add to Cart - $${grandTotal.toFixed(0)}`;
      case 'calendar': return `Book Appointment - $${grandTotal.toFixed(0)}`;
      case 'quote': return 'Request Quote';
      default: return 'Continue';
    }
  }, [type, grandTotal]);

  return (
    <div className={`bg-surface-elevated rounded-xl border border-border-primary p-3 space-y-4 ${className}`}>
      
      <div className="flex items-end justify-between">
        <PriceTag price={pricePerUnit} suffix={unitLabel} size="lg" />
        {rating ? <RatingBadge rating={rating} reviewCount={reviewCount} /> : null}
      </div>

      
      {urgency && <UrgencyCue type={urgency.type} value={urgency.value} />}

      
      {type === 'date-range' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <SimpleDateInput label="Check-in" value={checkIn} onChange={setCheckIn} />
            <SimpleDateInput label="Check-out" value={checkOut} onChange={setCheckOut} />
          </div>
          <QuantitySelector value={guests} min={1} max={maxQuantity} onChange={setGuests} label="Guests" />
          {checkIn && checkOut && (
            <div className="text-xs text-ink-tertiary">
              {nights} {nights === 1 ? 'night' : 'nights'} × ${pricePerUnit}/night
            </div>
          )}
        </div>
      )}

      
      {type === 'date-time' && (
        <div className="space-y-2">
          <SimpleDateInput label="Date" value={checkIn} onChange={setCheckIn} />
          {timeSlots && timeSlots.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">Time</label>
              <div className="flex flex-wrap gap-1.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedTime === slot
                        ? 'bg-accent-500 text-white'
                        : 'bg-surface-secondary text-ink-secondary border border-border-primary hover:border-accent-500'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
          <QuantitySelector value={quantity} min={1} max={maxQuantity} onChange={setQuantity} label="Guests" />
        </div>
      )}

      
      {type === 'calendar' && services && services.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Service</label>
          <div className="space-y-1.5">
            {services.map((svc, i) => (
              <button
                key={i}
                onClick={() => onServiceChange?.(i)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedService === i
                    ? 'bg-accent-500/10 border border-accent-500/30 text-accent-500'
                    : 'bg-surface-secondary border border-border-primary text-ink-secondary hover:border-accent-500/30'
                }`}
              >
                <span className="font-medium">{svc.name}</span>
                <span className="text-xs">${svc.price} . {svc.duration}</span>
              </button>
            ))}
          </div>
          <SimpleDateInput label="Preferred Date" value={checkIn} onChange={setCheckIn} />
          {timeSlots && timeSlots.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedTime === slot
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface-secondary text-ink-secondary border border-border-primary'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      
      {type === 'ticket' && ticketTypes && ticketTypes.length > 0 && (
        <div className="space-y-2">
          {ticketTypes.map((ticket, i) => (
            <button
              key={i}
              onClick={() => setSelectedTicket(i)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selectedTicket === i
                  ? 'bg-accent-500/10 border border-accent-500/30'
                  : 'bg-surface-secondary border border-border-primary'
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-ink-primary">{ticket.name}</div>
                <div className="text-xs text-ink-tertiary">{ticket.available} left</div>
              </div>
              <span className="font-bold text-ink-primary">${ticket.price}</span>
            </button>
          ))}
          <QuantitySelector value={quantity} min={1} max={10} onChange={setQuantity} label="Quantity" />
        </div>
      )}

      
      {type === 'donation' && (
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">Amount (XCD)</label>
          <div className="grid grid-cols-3 gap-1.5">
            {donationAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => { setDonationAmount(amt); setCustomDonation(''); }}
                className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                  donationAmount === amt && !customDonation
                    ? 'bg-accent-500 text-white'
                    : 'bg-surface-secondary text-ink-secondary border border-border-primary hover:border-accent-500'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={customDonation}
            onChange={(e) => setCustomDonation(e.target.value)}
            placeholder="Custom amount"
            className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-primary text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-500"
          />
        </div>
      )}

      
      {type === 'cart' && (
        <div className="space-y-3">
          {itemImage && (
            <div className="flex items-center gap-3 p-2 bg-surface-secondary rounded-lg">
              <img src={itemImage} alt={itemName} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-primary truncate">{itemName}</p>
                <p className="text-xs text-ink-tertiary">${pricePerUnit} each</p>
              </div>
            </div>
          )}
          <QuantitySelector value={cartQty} min={1} max={99} onChange={setCartQty} label="Quantity" />
        </div>
      )}

      
      {type === 'quote' && (
        <div className="space-y-2">
          <p className="text-xs text-ink-secondary">
            Fill in your details and the provider will send you a custom quote.
          </p>
          <textarea
            placeholder="Describe what you need..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-primary text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-500 resize-none"
          />
        </div>
      )}

      
      {type !== 'quote' && total > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border-primary">
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-ink-primary pt-1.5 border-t border-border-primary">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)} <span className="text-xs font-normal text-ink-tertiary">XCD</span></span>
          </div>
        </div>
      )}

      
      <button
        onClick={onCtaClick}
        disabled={ctaDisabled}
        className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-400 text-white font-bold rounded-xl hover:from-accent-600 hover:to-accent-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {ctaLabel || defaultCtaLabel}
      </button>

      
      <div className="space-y-1.5">
        {cancellationText && (
          <p className="text-[10px] text-ink-tertiary text-center">{cancellationText}</p>
        )}
        <div className="flex items-center justify-center gap-3 text-[10px] text-ink-tertiary font-medium">
          <EmojiIcon emoji="🔒" size=16 className="flex items-center gap-1" />
          <span>.</span>
          <EmojiIcon emoji="✓" size=16 className="flex items-center gap-1" />
          <span>.</span>
          <EmojiIcon emoji="💳" size=16 className="flex items-center gap-1" />
        </div>
      </div>
    </div>
  );
}
