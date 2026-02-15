import React, { useState, useEffect } from 'react';
import { 
  Calendar, CreditCard, LayoutDashboard, Package, 
  Users, Settings, LogOut, ChevronRight, X, 
  Edit, Trash2, Check, AlertCircle, TrendingUp, 
  FileText, Sparkles, User, Lock, History, Search,
  Menu, Plus
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where,
  onSnapshot, Timestamp, setDoc
} from 'firebase/firestore';
import { db, isFirebaseInitialized, firebaseError } from './firebaseConfig';
import './index.css';

// --- DATA DUMMY & UTILITAS ---

const initialProducts = [
  { 
    id: 1, 
    name: "Sony Alpha a7 III Kit", 
    category: "Kamera", 
    price: 350000, 
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000", 
    minDp: 30, 
    desc: "Kamera full-frame mirrorless terbaik untuk foto dan video profesional." 
  },
  { 
    id: 2, 
    name: "Jasa Fotografer Wedding", 
    category: "Jasa", 
    price: 2500000, 
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=1000", 
    minDp: 50, 
    desc: "Paket dokumentasi wedding 8 jam kerja + edit kualitas tinggi." 
  },
  { 
    id: 3, 
    name: "DJI Mavic Air 2", 
    category: "Drone", 
    price: 500000, 
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=1000", 
    minDp: 40, 
    desc: "Drone lipat dengan kamera 4K dan fitur pintar untuk pemula." 
  },
  { 
    id: 4, 
    name: "Tenda Camping Eiger 4P", 
    category: "Outdoor", 
    price: 75000, 
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1000", 
    minDp: 20, 
    desc: "Tenda kapasitas 4 orang, waterproof dan tangguh di alam." 
  },
];

const initialBookings = [
  { id: 'ORD-001', productId: 1, productName: "Sony Alpha a7 III Kit", date: "2023-10-25", status: "Selesai", total: 350000 },
  { id: 'ORD-003', productId: 2, productName: "Jasa Fotografer Wedding", date: "2023-11-05", status: "Booked", total: 2500000 },
];

const mockChartData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
];

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// --- KOMPONEN UTAMA ---

export default function SewaProApp() {
  console.log('🎯 App render - Firebase initialized:', isFirebaseInitialized);
  
  const [role, setRole] = useState('user'); 
  const [view, setView] = useState('home');
  
  // Initialize products from localStorage or initial data
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('sewapro_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });
  
  // Initialize bookings from localStorage or initial data
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('sewapro_bookings');
      return saved ? JSON.parse(saved) : initialBookings;
    } catch {
      return initialBookings;
    }
  });
  
  const [cart, setCart] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Always start as NOT loading if Firebase not initialized
  const [loadingFirebase, setLoadingFirebase] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(!isFirebaseInitialized);
  
  const [notification, setNotification] = useState(null);
  
  // States for Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Kamera',
    price: 0,
    minDp: 30,
    desc: '',
    image: ''
  });

  // Only load from Firebase if it's actually initialized
  useEffect(() => {
    if (!isFirebaseInitialized || !db) {
      console.log('✅ Firebase not needed - using localStorage directly');
      return;
    }

    console.log('🔥 Firebase available - attempting to load data...');
    
    const loadFromFirebase = async () => {
      const timer = setTimeout(() => {
        console.warn('⏱️ Firebase timeout - keeping localStorage');
        setLoadingFirebase(false);
      }, 2000);

      try {
        // Load products
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        if (!productsSnapshot.empty) {
          const firebaseProducts = [];
          productsSnapshot.forEach((doc) => {
            firebaseProducts.push({ ...doc.data(), docId: doc.id });
          });
          setProducts(firebaseProducts);
          localStorage.setItem('sewapro_products', JSON.stringify(firebaseProducts));
        }

        // Load bookings
        const bookingsRef = collection(db, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsRef);
        
        if (!bookingsSnapshot.empty) {
          const firebaseBookings = [];
          bookingsSnapshot.forEach((doc) => {
            firebaseBookings.push({ ...doc.data(), docId: doc.id });
          });
          setBookings(firebaseBookings);
          localStorage.setItem('sewapro_bookings', JSON.stringify(firebaseBookings));
        }

        clearTimeout(timer);
        setLoadingFirebase(false);
        console.log('✅ Firebase data loaded');
      } catch (error) {
        console.error('❌ Firebase error:', error);
        clearTimeout(timer);
        setLoadingFirebase(false);
      }
    };

    loadFromFirebase();
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      showNotification('Nama produk harus diisi!', 'error');
      return;
    }
    if (!newProduct.category.trim()) {
      showNotification('Kategori harus diisi!', 'error');
      return;
    }
    if (newProduct.price <= 0) {
      showNotification('Harga harus lebih dari 0!', 'error');
      return;
    }
    if (newProduct.minDp < 0 || newProduct.minDp > 100) {
      showNotification('Minimum DP harus antara 0-100%!', 'error');
      return;
    }

    const productToAdd = {
      id: Math.max(0, ...products.map(p => p.id)) + 1,
      name: newProduct.name,
      category: newProduct.category,
      price: parseInt(newProduct.price),
      minDp: parseInt(newProduct.minDp),
      desc: newProduct.desc,
      image: newProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000'
    };

    const updatedProducts = [...products, productToAdd];
    setProducts(updatedProducts);
    localStorage.setItem('sewapro_products', JSON.stringify(updatedProducts));
    
    // Reset form
    setNewProduct({
      name: '',
      category: 'Kamera',
      price: 0,
      minDp: 30,
      desc: '',
      image: ''
    });
    setShowAddProductModal(false);
    showNotification(`Produk "${productToAdd.name}" berhasil ditambahkan!`, 'success');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateProduct = async (id, updatedData) => {
    try {
      if (!isFirebaseInitialized || !db) {
        // Use localStorage
        const updated = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
        setProducts(updated);
        localStorage.setItem('sewapro_products', JSON.stringify(updated));
      } else {
        const productDoc = doc(db, 'products', `product_${id}`);
        await updateDoc(productDoc, updatedData);
        setProducts(products.map(p => p.id === id ? { ...p, ...updatedData } : p));
      }
      showNotification("Produk berhasil diperbarui!");
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification("Gagal memperbarui produk!", "error");
    }
  };

  const handleBooking = async (product, date) => {
    try {
      const newBooking = {
        productId: product.id,
        productName: product.name,
        date: date,
        status: 'Booked',
        total: product.price,
        createdAt: new Date().toISOString()
      };
      
      if (!isFirebaseInitialized || !db) {
        // Use localStorage
        const bookingId = `ORD-${Math.floor(Math.random() * 10000)}`;
        const bookingWithId = { ...newBooking, id: bookingId, docId: bookingId };
        setBookings([bookingWithId, ...bookings]);
        const allBookings = [bookingWithId, ...bookings];
        localStorage.setItem('sewapro_bookings', JSON.stringify(allBookings));
      } else {
        const docRef = await addDoc(collection(db, 'bookings'), newBooking);
        setBookings([{ ...newBooking, docId: docRef.id, id: docRef.id }, ...bookings]);
      }
      
      setView('profile');
      showNotification("Booking berhasil dibuat!");
    } catch (error) {
      console.error('Error creating booking:', error);
      showNotification("Gagal membuat booking!", "error");
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
      try {
        if (!isFirebaseInitialized || !db) {
          // Use localStorage
          const updated = bookings.map(b => b.id === id || b.docId === id ? { ...b, status: 'Dibatalkan' } : b);
          setBookings(updated);
          localStorage.setItem('sewapro_bookings', JSON.stringify(updated));
        } else {
          const bookingDoc = doc(db, 'bookings', id);
          await updateDoc(bookingDoc, { status: 'Dibatalkan' });
          setBookings(bookings.map(b => b.id === id || b.docId === id ? { ...b, status: 'Dibatalkan' } : b));
        }
        showNotification("Pesanan dibatalkan.", 'error');
      } catch (error) {
        console.error('Error canceling booking:', error);
        showNotification("Gagal membatalkan pesanan!", "error");
      }
    }
  };

  const rescheduleBooking = async (id, newDate) => {
    try {
      if (!isFirebaseInitialized || !db) {
        // Use localStorage
        const updated = bookings.map(b => b.id === id || b.docId === id ? { ...b, date: newDate } : b);
        setBookings(updated);
        localStorage.setItem('sewapro_bookings', JSON.stringify(updated));
      } else {
        const bookingDoc = doc(db, 'bookings', id);
        await updateDoc(bookingDoc, { date: newDate });
        setBookings(bookings.map(b => b.id === id || b.docId === id ? { ...b, date: newDate } : b));
      }
      showNotification("Jadwal berhasil diubah!");
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      showNotification("Gagal mengubah jadwal!", "error");
    }
  };

  // Show loading or error state while Firebase data is being loaded
  if (loadingFirebase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Memuat Data</h2>
          <p className="text-gray-500 mb-2">{useLocalStorage ? "Menggunakan local storage..." : "Menghubungkan ke Firebase..."}</p>
          {firebaseError && (
            <p className="text-xs text-orange-600 bg-orange-50 px-4 py-2 rounded-lg inline-block">
              ⚠️ Menggunakan mode offline (localStorage)
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex items-center cursor-pointer gap-1.5 sm:gap-2" onClick={() => {setView('home'); setMobileMenuOpen(false)}}>
              <Package className="h-5 w-5 sm:h-7 sm:w-7 text-indigo-600 flex-shrink-0" />
              <span className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 truncate">
                SewaPro
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {role === 'user' && (
                <button 
                  onClick={() => setView('profile')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${view === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pesanan & Profil
                </button>
              )}
              <button 
                onClick={() => {
                  const newRole = role === 'user' ? 'admin' : 'user';
                  setRole(newRole);
                  setView(newRole === 'admin' ? 'admin-dashboard' : 'home');
                }}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition border-l pl-6 border-gray-200"
              >
                <User className="h-4 w-4 mr-2" />
                {role === 'user' ? 'Admin Panel' : 'User View'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 focus:outline-none">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-3 sm:px-6 pt-2 pb-4 space-y-2 animate-slide-in-from-top">
            {role === 'user' && (
              <button 
                onClick={() => {setView('profile'); setMobileMenuOpen(false)}}
                className="w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 flex items-center"
              >
                <History className="h-4 w-4 mr-3" /> Pesanan Saya
              </button>
            )}
            <button 
              onClick={() => {
                const newRole = role === 'user' ? 'admin' : 'user';
                setRole(newRole);
                setView(newRole === 'admin' ? 'admin-dashboard' : 'home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 flex items-center"
            >
              <Users className="h-4 w-4 mr-3" /> {role === 'user' ? 'Masuk sebagai Admin' : 'Masuk sebagai User'}
            </button>
          </div>
        )}
      </nav>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 px-4 sm:px-6 py-3 rounded-xl shadow-lg text-white font-bold text-sm ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'} animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Content Area */}
      <main className="flex-grow w-full">
        {role === 'user' ? (
          <>
            {view === 'home' && <HomeView products={products} onBook={(p) => { setCart(p); setView('booking'); }} />}
            {view === 'booking' && <BookingView product={cart} onConfirm={handleBooking} onCancel={() => setView('home')} />}
            {view === 'profile' && <UserProfile bookings={bookings} onCancel={cancelBooking} onReschedule={rescheduleBooking} />}
          </>
        ) : (
          <AdminDashboard 
            products={products} 
            updateProduct={updateProduct} 
            chartData={mockChartData}
            bookings={bookings}
            showAddProductModal={showAddProductModal}
            setShowAddProductModal={setShowAddProductModal}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            handleAddProduct={handleAddProduct}
            showNotification={showNotification}
          />
        )}
      </main>

      {/* Mobile Bottom Spacer (for thumb-friendly navigation if needed) */}
      <div className="h-4 md:hidden"></div>
    </div>
  );
}

// --- SUB-KOMPONEN USER ---

function HomeView({ products, onBook }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Hero Section - Full Width */}
      <div className="w-full bg-indigo-600 overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative px-3 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40 text-center sm:text-left flex flex-col sm:flex-row items-center gap-12 max-w-7xl mx-auto">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Sewa Kebutuhanmu <br className="hidden sm:block" /> Dengan Mudah.
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-indigo-100 max-w-xl">
              Platform sewa barang & jasa terpercaya. Dapatkan akses ke alat profesional tanpa biaya kepemilikan tinggi.
            </p>
          </div>
          <div className="hidden lg:block">
             <Package className="h-32 w-32 text-indigo-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Content Section - With Padding & Max Width */}
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-16 sm:py-24 lg:py-32">
          {/* Search & Filter */}
          <div className="flex flex-col gap-8 sm:gap-12 sm:flex-row sm:justify-between sm:items-end pb-16 sm:pb-24 lg:pb-32 border-b-2 border-gray-100">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Katalog Pilihan</h2>
              <p className="text-sm text-gray-500 mt-1.5">Temukan barang atau jasa yang Anda butuhkan</p>
            </div>
            <div className="relative w-full sm:w-96 group">
              <input 
                type="text" 
                placeholder="Cari kamera, tenda, atau fotografer..." 
                className="w-full pl-11 pr-5 py-3.5 sm:py-4 text-base rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all shadow-md group-hover:shadow-lg group-hover:border-indigo-300 bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 sm:top-4 h-5 w-5 sm:h-5 sm:w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>

          {/* Grid Produk - Mobile Optimized */}
          <div className="pt-16 sm:pt-24 lg:pt-32">
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 sm:gap-8 lg:gap-10">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
            <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur shadow-sm px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                {product.category}
              </div>
            </div>
            <div className="p-6 sm:p-8 flex flex-col flex-grow">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 leading-tight line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-6 sm:mb-8 flex-grow leading-relaxed line-clamp-2">{product.desc}</p>
              
              <div className="mt-auto space-y-4 sm:space-y-5">
                <div className="flex justify-between items-end border-t border-gray-50 pt-3 sm:pt-4">
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sewa/Hari</p>
                    <p className="text-indigo-600 font-black text-sm sm:text-base">{formatRupiah(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">DP</p>
                    <p className="text-gray-900 font-black text-sm sm:text-base">{product.minDp}%</p>
                  </div>
                </div>
                <button 
                  onClick={() => onBook(product)}
                  className="w-full py-2.5 sm:py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 font-bold text-xs sm:text-sm shadow-lg shadow-gray-200"
                >
                  Booking
                </button>
              </div>
            </div>
          </div>
        ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingView({ product, onConfirm, onCancel }) {
  const [date, setDate] = useState("");
  if (!product) return null;
  const dpAmount = (product.price * product.minDp) / 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-3 sm:p-0 z-50">
      <div className="w-full max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 sm:border-gray-100 animate-zoom-in max-h-[90vh] overflow-y-auto">
        <div className="bg-indigo-600 px-6 sm:px-8 py-4 sm:py-6 flex justify-between items-start sm:items-center text-white sticky top-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Detail Booking</h2>
            <p className="text-xs text-indigo-100 mt-0.5 sm:mt-1 opacity-80">Lengkapi data untuk reservasi.</p>
          </div>
          <button onClick={onCancel} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition flex-shrink-0 ml-4"><X size={20} /></button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div className="flex gap-3 sm:gap-5 items-center bg-gray-50 p-3 sm:p-4 rounded-3xl">
            <img src={product.image} alt={product.name} className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl object-cover shadow-sm flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-1 truncate">{product.name}</h3>
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] sm:text-[10px] font-black rounded uppercase mb-1.5">{product.category}</span>
              <p className="text-indigo-600 font-black text-sm sm:text-base">{formatRupiah(product.price)} <span className="text-xs text-gray-400 font-normal">/hari</span></p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-black text-gray-700 uppercase tracking-widest flex items-center">
                <Calendar size={12} className="mr-1.5 sm:mr-2" /> Pilih Tanggal Mulai
              </label>
              <input 
                type="date" 
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-sm"
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="bg-indigo-50/50 p-4 sm:p-6 rounded-3xl border border-indigo-100 flex justify-between items-center gap-4">
              <div className="space-y-0.5">
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Minimal DP ({product.minDp}%)</p>
                <p className="text-indigo-900 font-black text-lg sm:text-xl">{formatRupiah(dpAmount)}</p>
              </div>
              <div className="p-2 sm:p-3 bg-white rounded-2xl shadow-sm text-indigo-600 flex-shrink-0">
                <CreditCard size={20} />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button onClick={onCancel} className="flex-1 py-3 sm:py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition active:scale-95 text-sm">
              Batalkan
            </button>
            <button 
              disabled={!date}
              onClick={() => onConfirm(product, date)}
              className="flex-1 py-3 sm:py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95 text-sm"
            >
              Bayar & Pesan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfile({ bookings, onCancel, onReschedule }) {
  const [tab, setTab] = useState('orders');
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      setPassMsg('Konfirmasi password tidak cocok.');
      return;
    }
    setPassMsg('Password berhasil diubah secara simulasi.');
    setPassData({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="w-full">
      {/* Profile Hero Header */}
      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
        <div className="px-3 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
            <div className="w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-300 flex-shrink-0">
              <User size={56} className="w-16 sm:w-20 h-16 sm:h-20" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-4 leading-tight">Ahmad Faisal</h1>
              <p className="text-lg sm:text-xl text-indigo-100 mb-4 sm:mb-6">ahmad.faisal@email.com</p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
                <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-2xl">
                  <p className="text-xs text-indigo-100 font-bold uppercase mb-1">Total Booking</p>
                  <p className="text-2xl font-black text-white">{bookings.length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-2xl">
                  <p className="text-xs text-indigo-100 font-bold uppercase mb-1">Aktif</p>
                  <p className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'Booked').length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-2xl">
                  <p className="text-xs text-indigo-100 font-bold uppercase mb-1">Selesai</p>
                  <p className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'Selesai').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-12 sm:mb-16 lg:mb-20 border-b-2 border-gray-100 pb-4 sm:pb-6">
            <button
              onClick={() => setTab('orders')}
              className={`px-5 sm:px-8 py-3 sm:py-4 font-black text-base sm:text-lg uppercase tracking-wide transition-all relative ${
                tab === 'orders'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <History size={20} />
                Pesanan Saya
              </div>
              {tab === 'orders' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-lg"></div>
              )}
            </button>
            <button
              onClick={() => setTab('settings')}
              className={`px-5 sm:px-8 py-3 sm:py-4 font-black text-base sm:text-lg uppercase tracking-wide transition-all relative ${
                tab === 'settings'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock size={20} />
                Keamanan
              </div>
              {tab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-lg"></div>
              )}
            </button>
          </div>

          {/* Orders Section */}
          {tab === 'orders' && (
            <div>
              <div className="mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Riwayat Sewa Anda</h2>
                <p className="text-gray-500 text-lg">Kelola dan pantau semua pemesaan Anda di sini</p>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-[3rem] border-2 border-dashed border-gray-300">
                  <Package className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-3xl font-black text-gray-500 mb-2">Belum Ada Pesanan</h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">Mulai sewa barang atau jasa favorit Anda sekarang juga!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {bookings.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 sm:p-8 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${
                          item.status === 'Booked' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">{item.id}</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4 line-clamp-2 leading-tight">
                        {item.productName}
                      </h3>

                      {/* Date Info */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tanggal Sewa</p>
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-indigo-600" />
                          <p className="text-lg sm:text-xl font-black text-gray-900">{item.date}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="border-t border-gray-100 pt-4 sm:pt-6 mb-6 sm:mb-8">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Bayar</p>
                        <p className="text-2xl sm:text-3xl font-black text-indigo-600">{formatRupiah(item.total)}</p>
                      </div>

                      {/* Actions */}
                      {item.status === 'Booked' ? (
                        <div className="mt-auto space-y-3 sm:space-y-4">
                          {editingId === item.id ? (
                            <div className="space-y-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                              <label className="text-xs font-bold text-gray-700 uppercase">Ubah Tanggal</label>
                              <input
                                type="date"
                                className="w-full p-3 border border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none bg-white"
                                onChange={(e) => setNewDate(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { onReschedule(item.id, newDate); setEditingId(null); }}
                                  className="flex-1 p-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                                >
                                  <Check size={18} /> Simpan
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingId(item.id)}
                                className="w-full py-3 sm:py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition active:scale-95"
                              >
                                Ubah Jadwal
                              </button>
                              <button
                                onClick={() => onCancel(item.id)}
                                className="w-full py-3 sm:py-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-black uppercase tracking-widest hover:bg-red-100 transition active:scale-95"
                              >
                                Batalkan
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button className="w-full py-3 sm:py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest cursor-not-allowed">
                          {item.status === 'Selesai' ? '✓ Selesai' : '✗ Dibatalkan'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Section */}
          {tab === 'settings' && (
            <div className="max-w-2xl">
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Keamanan Akun</h2>
                <p className="text-gray-500 text-lg">Update password untuk menjaga keamanan akun Anda</p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 sm:p-12">
                <form onSubmit={handlePasswordChange} className="space-y-6 sm:space-y-8">
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-3">Password Saat Ini</label>
                    <input
                      type="password"
                      required
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-base"
                      value={passData.old}
                      onChange={e => setPassData({...passData, old: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-3">Password Baru</label>
                    <input
                      type="password"
                      required
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-base"
                      value={passData.new}
                      onChange={e => setPassData({...passData, new: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-wide mb-3">Konfirmasi Password</label>
                    <input
                      type="password"
                      required
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-base"
                      value={passData.confirm}
                      onChange={e => setPassData({...passData, confirm: e.target.value})}
                    />
                  </div>

                  {passMsg && (
                    <div className={`p-5 rounded-2xl text-base font-bold border-2 ${
                      passMsg.includes('berhasil')
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {passMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition active:scale-95 text-lg"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB-KOMPONEN ADMIN ---

function AdminDashboard({ 
  products, 
  updateProduct, 
  chartData, 
  bookings,
  showAddProductModal,
  setShowAddProductModal,
  newProduct,
  setNewProduct,
  handleAddProduct,
  showNotification
}) {
  const [tab, setTab] = useState('dashboard');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [reportType, setReportType] = useState('sales');

  const totalRevenue = bookings.reduce((sum, item) => item.status !== 'Dibatalkan' ? sum + item.total : sum, 0);
  const activeRentals = bookings.filter(b => b.status === 'Booked').length;

  const generateAI = async () => {
    setAiLoading(true);
    setAiResult(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        setAiResult('⚠️ Gemini API Key tidak dikonfigurasi.\n\nSilakan:\n1. Dapatkan API Key dari: https://aistudio.google.com/apikey\n2. Tambahkan ke file .env.local dengan key: VITE_GEMINI_API_KEY=your_key_here\n3. Restart aplikasi\n\nMenggunakan laporan demo untuk sekarang...');
        // Fallback ke laporan demo
        setTimeout(() => {
          if (reportType === 'sales') {
            setAiResult(`📊 LAPORAN ANALITIK PENJUALAN CERDAS\n\n📈 Ringkasan Performa:\nTotal Revenue Bulan Ini: ${formatRupiah(totalRevenue)}\nJumlah Pesanan Aktif: ${activeRentals} unit\nKatalog Produk: ${products.length} SKU\n\n⭐ Produk Terlaris:\n1. ${products[0]?.name || 'Kamera Sony'} - Trend naik 15%\n2. ${products[1]?.name || 'Drone DJI'} - Stok terbatas\n3. ${products[2]?.name || 'Laptop Gaming'} - High demand\n\n💡 Rekomendasi:\n• Tingkatkan stok produk terlaris\n• Buat promotional bundle untuk kategori Outdoor\n• Target market B2B untuk higher revenue\n\n🎯 Prediksi Bulan Depan:\nKenaikan ~20-25% berdasarkan trend saat ini`);
          } else {
            setAiResult(`💼 PROPOSAL KEMITRAAN STRATEGIS SEWAPRO\n\n📊 Metrik Bisnis:\nGross Transaction Value (GTV): ${formatRupiah(totalRevenue)}\nAktif Transaksi: ${activeRentals} penyewaan/bulan\nBase Produk: ${products.length} unit\nKategori: ${[...new Set(products.map(p => p.category))].slice(0, 3).join(', ')}\n\n🎯 Peluang Pasar:\n• Market sewa aset tumbuh 30% YoY\n• TAM (Total Addressable Market): Miliaran rupiah\n• Ekspansi vertikal ke kategori premium\n\n🚀 Proposal Kerjasama:\n• Revenue sharing model: 70-30 split\n• Dedicated account manager\n• Marketing co-investment\n• Tech integration support\n\n💰 Target Investor:\n• Venture Capital: Series A round\n• Strategic Partners di sektor retail/tourism\n• Institutional investors dengan focus tech`);
          }
          setAiLoading(false);
        }, 1500);
        return;
      }

      const prompt = reportType === 'sales' 
        ? `Buatkan laporan analitik penjualan profesional untuk platform sewa aset "SewaPro". Data: Revenue=${formatRupiah(totalRevenue)}, Pesanan Aktif=${activeRentals}, Produk=${products.length}. Berikan insights tentang: trend penjualan, analisis kompetitor, rekomendasi peningkatan revenue, dan forecast 3 bulan. Gunakan bahasa profesional dan terstruktur.`
        : `Buatkan proposal kemitraan strategis untuk investor di platform "SewaPro". Data: GTV=${formatRupiah(totalRevenue)}, Transaksi aktif=${activeRentals}, Catalog=${products.length}. Jelaskan: value proposition, market opportunity, business model, growth strategy, dan partnership terms. Buat persuasif dan detail.`;

      // Coba dengan model gemini-pro terlebih dahulu (lebih stabil)
      const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      let response = null;
      let lastError = null;

      for (const model of models) {
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          });

          if (response.ok) {
            console.log(`✅ Berhasil dengan model: ${model}`);
            break;
          } else {
            lastError = `${model}: ${response.status}`;
            console.warn(`❌ ${model} gagal (${response.status}), coba model berikutnya...`);
          }
        } catch (err) {
          lastError = err.message;
          console.warn(`❌ ${model} error: ${err.message}`);
        }
      }

      if (!response || !response.ok) {
        console.error('Semua model gagal. Error terakhir:', lastError);
        throw new Error(`Gemini API gagal dengan semua model. ${lastError || 'Periksa API Key dan koneksi internet.'}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API error');
      }

      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak dapat menghasilkan laporan';
      setAiResult(generatedText);
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMsg = error.message || 'Unknown error';
      
      // Tampilkan error yang jelas
      let userMessage = `❌ Error: ${errorMsg}\n\n`;
      
      if (errorMsg.includes('404')) {
        userMessage += `Model atau endpoint tidak ditemukan.\n\nPastikan:\n• API Key aktif di Google AI Studio\n• Tidak ada typo di API Key\n• Billing enabled di Google Cloud`;
      } else if (errorMsg.includes('403') || errorMsg.includes('permission')) {
        userMessage += `Akses ditolak.\n\nPastikan:\n• API Key memiliki permission yang benar\n• Billing sudah setup di Google Cloud\n• Project sudah linked dengan API Key`;
      } else if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        userMessage += `API Key tidak valid atau sudah expired.\n\nSolusi:\n• Generate API Key baru dari https://aistudio.google.com/apikey\n• Update di file .env.local\n• Restart aplikasi`;
      } else {
        userMessage += `${errorMsg}\n\nMenggunakan laporan demo untuk sekarang...`;
      }
      
      setAiResult(userMessage);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-16 sm:py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16">
      {/* Sidebar - Desktop and Mobile adaptive */}
      <div className="w-full lg:w-80 space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm h-fit overflow-x-auto lg:overflow-x-visible">
        <div className="flex lg:flex-col gap-3 sm:gap-4">
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
          { id: 'inventory', icon: <Package size={18} />, label: 'Inventaris' },
          { id: 'ai-report', icon: <Sparkles size={18} />, label: 'AI Analyst' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setTab(item.id)} 
            className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap lg:whitespace-normal ${tab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="mr-2 sm:mr-4 flex-shrink-0">{item.icon}</span> {item.label}
          </button>
        ))}
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="flex-1 space-y-8 sm:space-y-12 lg:space-y-16">
        {tab === 'dashboard' && (
          <div className="space-y-8 sm:space-y-12">
            {/* Page Header */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-2 sm:mb-4">Dashboard Admin</h1>
              <p className="text-gray-500 text-lg sm:text-xl">Kelola bisnis sewa Anda dengan mudah</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Total Revenue Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-xl shadow-indigo-200 border border-indigo-400">
                <div className="flex items-start justify-between mb-6 sm:mb-8">
                  <div>
                    <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-indigo-100 mb-2">Total Pendapatan</p>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight break-words">
                      {formatRupiah(totalRevenue)}
                    </h3>
                  </div>
                  <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
                    <TrendingUp size={32} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur w-fit px-4 py-2 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-bold text-white">+12% dari bulan lalu</span>
                </div>
              </div>

              {/* Active Rentals Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-xl shadow-purple-200 border border-purple-400">
                <div className="flex items-start justify-between mb-6 sm:mb-8">
                  <div>
                    <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-purple-100 mb-2">Pesanan Aktif</p>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                      {activeRentals}
                    </h3>
                    <p className="text-purple-100 text-sm sm:text-base font-medium mt-2">Penyewaan sedang berlangsung</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
                    <Package size={32} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Inventory Card */}
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-xl shadow-cyan-200 border border-cyan-400">
                <div className="flex items-start justify-between mb-6 sm:mb-8">
                  <div>
                    <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-cyan-100 mb-2">Total Inventaris</p>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                      {products.length}
                    </h3>
                    <p className="text-cyan-100 text-sm sm:text-base font-medium mt-2">SKU terdaftar dalam sistem</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
                    <Users size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section - Large & Readable */}
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-lg overflow-hidden">
              <div className="p-8 sm:p-10 lg:p-12 border-b-2 border-gray-50">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">Tren Revenue Bulanan</h2>
                <p className="text-gray-500 text-base sm:text-lg">Analisis pendapatan penyewaan selama 6 bulan terakhir</p>
              </div>
              <div className="p-8 sm:p-10 lg:p-12">
                <div className="h-96 sm:h-[28rem] lg:h-[32rem] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6B7280', fontSize: 14, fontWeight: 700}}
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#6B7280', fontSize: 14, fontWeight: 700}}
                        width={80}
                        tickFormatter={(value) => `${(value/1000)}K`}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '24px',
                          border: 'none',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          padding: '20px',
                          backgroundColor: '#FFFFFF'
                        }}
                        formatter={(value) => [`${formatRupiah(value)}`, 'Revenue']}
                        labelStyle={{ color: '#111827', fontSize: 14, fontWeight: 700 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#6366F1" 
                        strokeWidth={4}
                        dot={{ r: 8, fill: '#6366F1', strokeWidth: 3, stroke: '#fff' }}
                        activeDot={{ r: 12, fill: '#4F46E5', shadow: '0 0 25px rgba(99, 102, 241, 0.5)' }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="space-y-8 sm:space-y-12">
            {/* Page Header with Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-2 sm:mb-4">Manajemen Inventaris</h1>
                <p className="text-gray-500 text-lg sm:text-xl">Ubah harga sewa dan pengaturan DP untuk setiap produk</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap text-sm sm:text-base"
              >
                <Plus size={20} /> Tambah Produk
              </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-lg overflow-hidden">
              <div className="p-8 sm:p-10 lg:p-12 border-b-2 border-gray-50">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">Daftar Produk ({products.length})</h2>
                <p className="text-gray-500 text-base sm:text-lg">Perbarui informasi harga dan DP untuk semua produk sewa</p>
              </div>
              
              {/* Horizontal Scroll on Mobile */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead>
                    <tr className="border-b-2 border-gray-100 bg-gray-50">
                      <th className="px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-sm sm:text-base font-black text-gray-700 uppercase tracking-wider">Produk</th>
                      <th className="px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-sm sm:text-base font-black text-gray-700 uppercase tracking-wider">Harga Sewa/Hari</th>
                      <th className="px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-sm sm:text-base font-black text-gray-700 uppercase tracking-wider">Minimum DP</th>
                      <th className="px-6 sm:px-8 lg:px-10 py-4 sm:py-5 text-sm sm:text-base font-black text-gray-700 uppercase tracking-wider">Gambar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors group">
                        <td className="px-6 sm:px-8 lg:px-10 py-5 sm:py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-base sm:text-lg">{p.name}</p>
                              <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">SKU: {p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 lg:px-10 py-5 sm:py-6">
                          <input 
                            type="number" 
                            className="w-28 sm:w-32 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-900 text-sm sm:text-base group-hover:border-indigo-300 transition-all"
                            value={p.price} 
                            onChange={(e) => updateProduct(p.id, { price: parseInt(e.target.value) })}
                          />
                        </td>
                        <td className="px-6 sm:px-8 lg:px-10 py-5 sm:py-6">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="w-16 sm:w-20 px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none font-bold text-gray-900 text-sm sm:text-base group-hover:border-purple-300 transition-all"
                              value={p.minDp} 
                              onChange={(e) => updateProduct(p.id, { minDp: parseInt(e.target.value) })}
                            />
                            <span className="font-bold text-gray-700 text-sm sm:text-base">%</span>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 lg:px-10 py-5 sm:py-6">
                          <input 
                            type="text" 
                            className="w-40 sm:w-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-100 outline-none text-xs sm:text-sm text-gray-600 font-medium group-hover:border-gray-300 transition-all"
                            value={p.image} 
                            onChange={(e) => updateProduct(p.id, { image: e.target.value })}
                            placeholder="URL gambar..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'ai-report' && (
          <div className="space-y-8 sm:space-y-12">
            {/* Page Header */}
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600">AI-Powered Analytics</p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900">Smart Report Generator</h1>
                </div>
              </div>
              <p className="text-gray-500 text-lg sm:text-xl ml-0 sm:ml-16">Dapatkan insights bisnis mendalam dengan analyzer canggih</p>
            </div>

            {/* Report Type Selection */}
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-8 sm:p-10 lg:p-12 shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 sm:mb-8">Pilih Jenis Laporan</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Sales Report Card */}
                <button
                  onClick={() => setReportType('sales')}
                  className={`p-6 sm:p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                    reportType === 'sales'
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-500 shadow-lg shadow-indigo-100'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reportType === 'sales' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-bold uppercase tracking-wider text-xs mb-1 ${reportType === 'sales' ? 'text-indigo-600' : 'text-gray-500'}`}>Laporan Penjualan</p>
                      <h3 className="font-black text-lg text-gray-900">Analisis Sales</h3>
                      <p className="text-sm text-gray-500 mt-2">Trend penjualan, revenue, dan performance</p>
                    </div>
                  </div>
                </button>

                {/* Proposal Report Card */}
                <button
                  onClick={() => setReportType('proposal')}
                  className={`p-6 sm:p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                    reportType === 'proposal'
                      ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500 shadow-lg shadow-purple-100'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reportType === 'proposal' ? 'bg-purple-600' : 'bg-gray-300'}`}>
                      <FileText size={24} className="text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-bold uppercase tracking-wider text-xs mb-1 ${reportType === 'proposal' ? 'text-purple-600' : 'text-gray-500'}`}>Proposal Bisnis</p>
                      <h3 className="font-black text-lg text-gray-900">Rekomendasi Strategi</h3>
                      <p className="text-sm text-gray-500 mt-2">Insights dan saran pengembangan bisnis</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Report Generation Area */}
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-lg overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex flex-col">
              <div className="p-8 sm:p-10 lg:p-12 border-b-2 border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-1">Hasil Analisis</h2>
                  <p className="text-gray-500 text-base sm:text-lg">Laporan {reportType === 'sales' ? 'Penjualan' : 'Bisnis'} Anda</p>
                </div>
                {aiResult && (
                  <button
                    onClick={() => setAiResult(null)}
                    className="p-3 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>

              <div className="flex-grow flex flex-col items-center justify-center p-8 sm:p-12">
                {!aiResult && !aiLoading && (
                  <div className="max-w-md text-center space-y-6 sm:space-y-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg border-4 border-white">
                      <Sparkles size={48} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Siap Menganalisis</h3>
                      <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
                        Klik tombol di bawah untuk menghasilkan laporan {reportType === 'sales' ? 'penjualan' : 'bisnis'} mendalam menggunakan AI
                      </p>
                    </div>
                    <button
                      onClick={generateAI}
                      className="px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 text-base sm:text-lg"
                    >
                      Generate Laporan AI
                    </button>
                  </div>
                )}

                {aiLoading && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex justify-center gap-2">
                      <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce-delay-1"></div>
                      <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce-delay-2"></div>
                      <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce-delay-3"></div>
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-lg sm:text-xl font-black text-indigo-600 uppercase tracking-widest">Memproses Data</p>
                      <p className="text-sm sm:text-base text-gray-500">Menganalisis transaksi dan performa bisnis Anda...</p>
                    </div>
                  </div>
                )}

                {aiResult && (
                  <div className="w-full max-w-4xl animate-slide-in-from-bottom">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-8 sm:p-10 lg:p-12 rounded-2xl border-2 border-indigo-100 relative">
                      <div className="prose prose-indigo max-w-none">
                        <div className="text-gray-700 font-medium leading-relaxed whitespace-pre-line text-base sm:text-lg">
                          {aiResult}
                        </div>
                      </div>
                      <div className="mt-8 sm:mt-10 pt-8 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                        <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Laporan Siap Dibagikan
                        </span>
                        <button className="text-sm sm:text-base font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition">
                          📋 Salin ke Clipboard
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in-from-bottom">
            {/* Modal Header */}
            <div className="p-8 sm:p-10 lg:p-12 border-b-2 border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-1">Tambah Produk Baru</h2>
                <p className="text-gray-500 text-base sm:text-lg">Masukkan informasi produk atau jasa sewa Anda</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-3 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 sm:p-10 lg:p-12 space-y-6 sm:space-y-8">
              {/* Nama Produk */}
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">Nama Produk / Jasa</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Contoh: Sony Camera, Jasa Fotografer, Drone DJI"
                  className="w-full px-6 py-4 border-2 border-indigo-200 rounded-2xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-base sm:text-lg"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">Kategori</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-6 py-4 border-2 border-purple-200 rounded-2xl font-medium text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-base sm:text-lg"
                >
                  <option value="Kamera">🎥 Kamera</option>
                  <option value="Drone">🚁 Drone</option>
                  <option value="Laptop">💻 Laptop & Komputer</option>
                  <option value="Audio">🎧 Audio & Sound</option>
                  <option value="Outdoor">⛺ Outdoor & Camping</option>
                  <option value="Jasa">👨‍💼 Jasa & Layanan</option>
                  <option value="Lainnya">📦 Lainnya</option>
                </select>
              </div>

              {/* Price and DP Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Harga Sewa */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">Harga Sewa/Hari (Rp)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})}
                    placeholder="Contoh: 350000"
                    className="w-full px-6 py-4 border-2 border-cyan-200 rounded-2xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-base sm:text-lg"
                  />
                </div>

                {/* Minimum DP */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">Minimum DP (%)</label>
                  <input
                    type="number"
                    value={newProduct.minDp}
                    onChange={(e) => setNewProduct({...newProduct, minDp: parseInt(e.target.value) || 0})}
                    placeholder="Contoh: 30"
                    min="0"
                    max="100"
                    className="w-full px-6 py-4 border-2 border-pink-200 rounded-2xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all text-base sm:text-lg"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">Deskripsi Produk</label>
                <textarea
                  value={newProduct.desc}
                  onChange={(e) => setNewProduct({...newProduct, desc: e.target.value})}
                  placeholder="Jelaskan detail produk, fitur, keunggulan, spesifikasi, dll..."
                  rows="4"
                  className="w-full px-6 py-4 border-2 border-orange-200 rounded-2xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none text-base sm:text-lg"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3">URL Gambar (Opsional)</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-6 py-4 border-2 border-green-200 rounded-2xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-base sm:text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">Jika kosong, akan menggunakan gambar default</p>
              </div>

              {/* Preview Image */}
              {newProduct.image && (
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">Preview Gambar</label>
                  <div className="w-full h-48 rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                    <img 
                      src={newProduct.image} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-2 border-gray-50">
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-900 font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all text-base sm:text-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 text-base sm:text-lg"
                >
                  Simpan Produk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
