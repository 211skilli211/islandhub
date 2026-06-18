'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api, { getImageUrl } from '@/lib/api';
import toast from '@/lib/toast';
import { Package, Plus, Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    images: string[];
    photos: string[];
    status: string;
    store_id: number;
    store_name?: string;
    category: string;
    created_at: string;
}

interface StoreOption {
    id: number;
    name: string;
    slug: string;
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState<string>(searchParams?.get('store') || 'all');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'product',
        store_id: '',
        image_url: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const storesRes = await api.get('/admin/stores');
                const allStores = storesRes.data.stores || storesRes.data || [];
                const partnerStores = allStores.filter((s: any) => s.vendor_id === 2 || s.vendor_name === 'IBT Solutions');
                setStores(partnerStores.map((s: any) => ({ id: s.store_id || s.id, name: s.name, slug: s.slug })));

                const productsRes = await api.get('/listings', { params: { limit: 100 } });
                const allProducts = productsRes.data.listings || productsRes.data || [];
                const partnerStoreIds = partnerStores.map((s: any) => s.store_id || s.id);
                const partnerProducts = allProducts.filter((p: any) => partnerStoreIds.includes(p.store_id));
                setProducts(partnerProducts.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    images: p.images || [],
                    photos: p.photos || [],
                    status: p.status,
                    store_id: p.store_id,
                    category: p.category,
                    created_at: p.created_at,
                })));
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = selectedStore === 'all'
        ? products
        : products.filter(p => p.store_id === Number(selectedStore));

    const getStoreName = (storeId: number) => {
        const store = stores.find(s => s.id === storeId);
        return store?.name || 'Unknown';
    };

    const getProductImage = (product: Product) => {
        const img = product.images?.[0] || product.photos?.[0];
        return img ? getImageUrl(img) : null;
    };

    const handleSave = async () => {
        if (!formData.title || !formData.price || !formData.store_id) {
            toast.error('Title, price, and store are required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                store_id: parseInt(formData.store_id),
                images: formData.image_url ? [formData.image_url] : [],
                status: 'active',
            };

            if (editingProduct) {
                await api.put(`/listings/${editingProduct.id}`, payload);
                toast.success('Product updated');
            } else {
                await api.post('/listings', payload);
                toast.success('Product created');
            }

            setShowForm(false);
            setEditingProduct(null);
            setFormData({ title: '', description: '', price: '', category: 'product', store_id: '', image_url: '' });
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description || '',
            price: String(product.price),
            category: product.category || 'product',
            store_id: String(product.store_id),
            image_url: product.images?.[0] || product.photos?.[0] || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Delete "${product.title}"?`)) return;
        try {
            await api.delete(`/listings/${product.id}`);
            toast.success('Product deleted');
            setProducts(prev => prev.filter(p => p.id !== product.id));
        } catch {
            toast.error('Failed to delete product');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary dark:text-white">Partner Products</h2>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Manage products for IBT partner stores</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ title: '', description: '', price: '', category: 'product', store_id: '', image_url: '' }); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                    onClick={() => setSelectedStore('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        selectedStore === 'all' ? 'bg-accent-500/100 text-white' : 'bg-surface-elevated dark:bg-surface-tertiary text-ink-secondary dark:text-ink-tertiary border border-border-primary dark:border-border-primary'
                    }`}
                >
                    All Stores ({products.length})
                </button>
                {stores.map(store => {
                    const count = products.filter(p => p.store_id === store.id).length;
                    return (
                        <button
                            key={store.id}
                            onClick={() => setSelectedStore(String(store.id))}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                selectedStore === String(store.id) ? 'bg-accent-500/100 text-white' : 'bg-surface-elevated dark:bg-surface-tertiary text-ink-secondary dark:text-ink-tertiary border border-border-primary dark:border-border-primary'
                            }`}
                        >
                            {store.name} ({count})
                        </button>
                    );
                })}
            </div>

            
            {showForm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-elevated dark:bg-surface-tertiary p-8 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-black text-ink-primary dark:text-white mb-6">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Store</label>
                                <select
                                    value={formData.store_id}
                                    onChange={e => setFormData(prev => ({ ...prev, store_id: e.target.value }))}
                                    className="w-full p-3 bg-surface-primary dark:bg-surface-tertiary border-2 border-border-primary dark:border-border-primary rounded-xl font-bold text-ink-secondary dark:text-ink-tertiary outline-none focus:border-teal-500"
                                >
                                    <option value="">Select store...</option>
                                    {stores.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Fine Sea Salt 500g"
                                    className="w-full p-3 bg-surface-primary dark:bg-surface-tertiary border-2 border-border-primary dark:border-border-primary rounded-xl font-bold text-ink-secondary dark:text-ink-tertiary outline-none focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Product description..."
                                    rows={3}
                                    className="w-full p-3 bg-surface-primary dark:bg-surface-tertiary border-2 border-border-primary dark:border-border-primary rounded-xl font-bold text-ink-secondary dark:text-ink-tertiary outline-none focus:border-teal-500 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Price (XCD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full p-3 bg-surface-primary dark:bg-surface-tertiary border-2 border-border-primary dark:border-border-primary rounded-xl font-bold text-ink-secondary dark:text-ink-tertiary outline-none focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full p-3 bg-surface-primary dark:bg-surface-tertiary border-2 border-border-primary dark:border-border-primary rounded-xl font-bold text-ink-secondary dark:text-ink-tertiary outline-none focus:border-teal-500"
                                    >
                                        <option value="product">Product</option>
                                        <option value="food">Food</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full p-3 bg-surface-primary dark:bg-surface-tertiary border-2 border-border-primary dark:border-border-primary rounded-xl font-bold text-ink-secondary dark:text-ink-tertiary outline-none focus:border-teal-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowForm(false); setEditingProduct(null); }}
                                className="flex-1 py-3 text-ink-tertiary font-bold rounded-xl hover:bg-surface-secondary dark:hover:bg-surface-tertiary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-surface-secondary dark:bg-surface-tertiary animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-surface-elevated dark:bg-surface-tertiary rounded-2xl border border-border-primary dark:border-border-primary">
                    <Package className="w-12 h-12 text-ink-tertiary mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-ink-primary dark:text-white mb-2">No Products</h3>
                    <p className="text-ink-tertiary mb-6">Add products to your partner stores.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl border border-border-primary dark:border-border-primary overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-40 bg-surface-secondary dark:bg-surface-tertiary overflow-hidden">
                                {getProductImage(product) ? (
                                    <img src={getProductImage(product)!} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-ink-tertiary" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-bold text-ink-primary dark:text-white text-sm line-clamp-1">{product.title}</h3>
                                    <span className="text-sm font-black text-accent-400">${Number(product.price).toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-ink-tertiary mb-3">{getStoreName(product.store_id)} - {product.category}</p>
                                <p className="text-xs text-ink-tertiary dark:text-ink-tertiary line-clamp-2 mb-3 min-h-[2rem]">{product.description}</p>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/store/${stores.find(s => s.id === product.store_id)?.slug || ''}`}
                                        target="_blank"
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-surface-secondary dark:bg-surface-tertiary text-ink-secondary dark:text-ink-tertiary rounded-lg text-xs font-bold hover:bg-surface-tertiary dark:hover:bg-surface-tertiary transition-colors"
                                    >
                                        <Eye className="w-3 h-3" />
                                        View
                                    </a>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-sand-500/10 text-sand-500 rounded-lg text-xs font-bold hover:bg-sand-500/15 transition-colors"
                                    >
                                        <Edit className="w-3 h-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product)}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminIBTPartnerProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
