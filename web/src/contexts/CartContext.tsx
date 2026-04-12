'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface CartItem {
    item_id: number;
    listing_id: number;
    title: string;
    type: string;
    price: number;
    quantity: number;
    image_url?: string;
    store_name?: string;
    store_slug?: string;
    price_snapshot: number;

    // Category-specific fields
    rental_start_date?: string;
    rental_end_date?: string;
    rental_duration_days?: number;
    service_package?: string;
    appointment_slot?: string;
    selected_variant?: any;
    selected_addons?: any[];
    selected_sides?: any[];
    donation_suggested?: boolean;
    side_ids?: number[]; // To prompt for sides in cart
}

interface Cart {
    cart_id: number | null;
    items: CartItem[];
    delivery_type: 'delivery' | 'pickup';
    delivery_address?: string;
}

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    itemCount: number;
    totalAmount: number;
    addToCart: (listingId: number, options?: {
        itemId?: number;
        quantity?: number;
        rentalStartDate?: string;
        rentalEndDate?: string;
        servicePackage?: string;
        appointmentSlot?: string;
        selectedVariant?: any;
        selectedAddons?: any[];
        selectedSides?: any[];
    }) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    setDeliverySettings: (type: 'delivery' | 'pickup', address?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);

    // Get or create session ID
    const getSessionId = () => {
        let sessionId = localStorage.getItem('cart_session_id');
        if (!sessionId) {
            sessionId = uuidv4();
            localStorage.setItem('cart_session_id', sessionId);
        }
        return sessionId;
    };

    // Fetch cart on mount
    useEffect(() => {
        refreshCart();
    }, []);

    const refreshCart = async () => {
        try {
            setLoading(true);
            const sessionId = getSessionId();
            const response = await api.get('/cart', {
                headers: { 'x-session-id': sessionId }
            });

            // Handle null cart (when tables not initialized)
            if (!response.data.cart) {
                setCart({
                    cart_id: null,
                    items: [],
                    delivery_type: 'pickup',
                    delivery_address: ''
                });
                return;
            }

            setCart({
                cart_id: response.data.cart.cart_id,
                items: response.data.items || [],
                delivery_type: response.data.cart.delivery_type || 'pickup',
                delivery_address: response.data.cart.delivery_address
            });
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            // Set empty cart on error
            setCart({
                cart_id: null,
                items: [],
                delivery_type: 'pickup',
                delivery_address: ''
            });
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (listingId: number, options: any = {}) => {
        try {
            setLoading(true);
            const sessionId = getSessionId();

            await api.post('/cart/add', {
                listingId,
                itemId: options.itemId,
                quantity: options.quantity || 1,
                rentalStartDate: options.rentalStartDate,
                rentalEndDate: options.rentalEndDate,
                servicePackage: options.servicePackage,
                appointmentSlot: options.appointmentSlot,
                selectedVariant: options.selectedVariant,
                selectedAddons: options.selectedAddons,
                selectedSides: options.selectedSides
            }, {
                headers: { 'x-session-id': sessionId }
            });

            toast.success('Added to cart!');
            await refreshCart();
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        try {
            setLoading(true);
            await api.patch(`/cart/items/${itemId}`, { quantity });
            await refreshCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Failed to update quantity');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId: number) => {
        try {
            setLoading(true);
            await api.delete(`/cart/items/${itemId}`);
            toast.success('Item removed');
            await refreshCart();
        } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item');
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            const sessionId = getSessionId();
            await api.delete('/cart/clear', {
                headers: { 'x-session-id': sessionId }
            });
            toast.success('Cart cleared');
            await refreshCart();
        } catch (error) {
            console.error('Failed to clear cart:', error);
            toast.error('Failed to clear cart');
        } finally {
            setLoading(false);
        }
    };

    const setDeliverySettings = async (type: 'delivery' | 'pickup', address?: string) => {
        try {
            setLoading(true);
            const sessionId = getSessionId();
            await api.patch('/cart/settings', {
                deliveryType: type,
                deliveryAddress: address
            }, {
                headers: { 'x-session-id': sessionId }
            });
            await refreshCart();
        } catch (error) {
            console.error('Failed to update delivery settings:', error);
            toast.error('Failed to update delivery settings');
        } finally {
            setLoading(false);
        }
    };

    const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalAmount = cart?.items.reduce((sum, item) => sum + (item.price_snapshot * item.quantity), 0) || 0;

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                itemCount,
                totalAmount,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                refreshCart,
                setDeliverySettings
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
