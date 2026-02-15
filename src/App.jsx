import React, { useState, useEffect } from 'react';
import { 
  Calendar, CreditCard, LayoutDashboard, Package, 
  Users, Settings, LogOut, ChevronRight, X, 
  Edit, Trash2, Check, AlertCircle, TrendingUp, 
  FileText, Sparkles, User, Lock, History, Search,
  Menu
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
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
  const [role, setRole] = useState('user'); 
  const [view, setView] = useState('home'); 
  const [products, setProducts] = useState(initialProducts);
  const [bookings, setBookings] = useState(initialBookings);
  const [cart, setCart] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Session / Login
  const [session, setSession] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', role: 'user' });
  
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    try {
      const s = localStorage.getItem('sewapro_session');
      if (s) {
        const parsed = JSON.parse(s);
        setSession(parsed);
        setRole(parsed.role || 'user');
      } else {
        setShowLoginModal(true);
      }
    } catch {
      setShowLoginModal(true);
    }
  }, []);

  const handleLogin = () => {
    const { email, password, role: chosen } = loginForm;
    if (!email || !password) { showNotification('Email dan password harus diisi', 'error'); return; }

    if (chosen === 'admin') {
      const stored = localStorage.getItem('sewapro_admin_pw');
      if (!stored) {
        if (password.length < 6) { showNotification('Password admin minimal 6 karakter', 'error'); return; }
        localStorage.setItem('sewapro_admin_pw', password);
        showNotification('Password admin disimpan. Selanjutnya gunakan untuk login.', 'success');
      } else if (stored !== password) {
        showNotification('Password admin salah', 'error');
        return;
      }
    }

    const sess = { email, role: chosen };
    setSession(sess);
    setRole(chosen);
    localStorage.setItem('sewapro_session', JSON.stringify(sess));
    setShowLoginModal(false);
    setView(chosen === 'admin' ? 'admin-dashboard' : 'home');
    showNotification(`Berhasil masuk sebagai ${chosen}`);
  };

  const handleLogout = () => {
    setSession(null);
    setRole('user');
    localStorage.removeItem('sewapro_session');
    setShowLoginModal(true);
    setView('home');
    showNotification('Anda telah logout', 'success');
  };

  const updateProduct = (id, updatedData) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedData } : p));
    showNotification("Produk berhasil diperbarui!");
  };

  const handleBooking = (product, date) => {
    const qty = product.quantity || 1;
    const days = product.days || 1;
    const subtotal = (parseInt(product.price) || 0) * qty * days;
    const newBooking = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      productId: product.id,
      productName: product.name,
      date: date,
      status: 'Booked',
      items: [{ id: product.id, name: product.name, price: product.price, quantity: qty, days }],
      total: subtotal
    };
    setBookings([newBooking, ...bookings]);
    setView('profile');
    showNotification("Booking berhasil dibuat!");
  };

  const cancelBooking = (id) => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Dibatalkan' } : b));
      showNotification("Pesanan dibatalkan.", 'error');
    }
  };

  const rescheduleBooking = (id, newDate) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, date: newDate } : b));
    showNotification("Jadwal berhasil diubah!");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => {setView('home'); setMobileMenuOpen(false)}}>
              <Package className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                SewaPro
              </span>
            </div>
            
            {/* Desktop Nav - session aware */}
            <div className="hidden md:flex items-center space-x-6">
              {session?.role === 'user' && (
                <button 
                  onClick={() => setView('profile')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${view === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pesanan & Profil
                </button>
              )}
              {session ? (
                <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
                  <span className="text-sm text-gray-600">{session.email}</span>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="px-3 py-2 rounded-md text-sm font-medium text-indigo-600 bg-indigo-50">Masuk</button>
              )}
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
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-300">
            {session?.role === 'user' && (
              <button 
                onClick={() => {setView('profile'); setMobileMenuOpen(false)}}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 flex items-center"
              >
                <History className="h-4 w-4 mr-3" /> Pesanan Saya
              </button>
            )}
            {session ? (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 flex items-center">
                <LogOut className="h-4 w-4 mr-3" /> Logout
              </button>
            ) : (
              <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 flex items-center">
                <Users className="h-4 w-4 mr-3" /> Masuk
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 sm:top-20 sm:right-5 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-bold animate-bounce ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {notification.message}
        </div>
      )}

      {/* Login Modal (shows on first open or when logged out) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-black">Masuk ke SewaPro</h3>
                <p className="text-sm text-gray-500">Pilih role dan masuk untuk mengakses fitur</p>
              </div>
              <button onClick={() => setShowLoginModal(false)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select value={loginForm.role} onChange={(e) => setLoginForm({...loginForm, role: e.target.value})} className="w-full p-3 border rounded-lg">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} placeholder="email@domain.com" className="w-full p-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" className="w-full p-3 border rounded-lg" />
                {loginForm.role === 'admin' && !localStorage.getItem('sewapro_admin_pw') && (
                  <p className="text-xs text-gray-500 mt-2">Belum ada password admin. Masukkan password (min 6 karakter) untuk mengatur password admin pertama kali.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowLoginModal(false); }} className="flex-1 p-3 bg-gray-100 rounded-lg font-bold">Batal</button>
                <button onClick={handleLogin} className="flex-1 p-3 bg-indigo-600 text-white rounded-lg font-bold">Masuk</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {session ? (
          role === 'user' ? (
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
            />
          )
        ) : (
          <div className="py-20 text-center text-gray-500">Silakan masuk untuk melanjutkan.</div>
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
    <div className="space-y-6 sm:space-y-10">
      {/* Hero Section */}
      <div className="relative bg-indigo-600 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative px-6 py-12 sm:px-12 sm:py-20 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
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

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Katalog Pilihan</h2>
        <div className="relative w-full sm:w-80 group">
          <input 
            type="text" 
            placeholder="Cari kamera, tenda, atau fotografer..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:shadow-md"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
        </div>
      </div>

      {/* Grid Produk - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
            <div className="relative h-56 sm:h-48 overflow-hidden bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                {product.category}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-6 flex-grow leading-relaxed line-clamp-2">{product.desc}</p>
              
              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sewa/Hari</p>
                    <p className="text-indigo-600 font-black text-base">{formatRupiah(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">DP</p>
                    <p className="text-gray-900 font-black text-base">{product.minDp}%</p>
                  </div>
                </div>
                <button 
                  onClick={() => onBook(product)}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 font-bold text-sm shadow-lg shadow-gray-200"
                >
                  Booking Sekarang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingView({ product, onConfirm, onCancel }) {
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [days, setDays] = useState(1);
  if (!product) return null;
  const subtotal = (parseInt(product.price) || 0) * (parseInt(quantity) || 1) * (parseInt(days) || 1);
  const dpAmount = (subtotal * product.minDp) / 100;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center text-white">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Detail Booking</h2>
          <p className="text-xs text-indigo-100 mt-1 opacity-80">Lengkapi data untuk reservasi.</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition"><X size={24} /></button>
      </div>
      
      <div className="p-8 space-y-8">
        <div className="flex gap-5 items-center bg-gray-50 p-4 rounded-3xl">
          <img src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">{product.name}</h3>
            <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black rounded uppercase mb-2">{product.category}</span>
            <p className="text-indigo-600 font-black">{formatRupiah(product.price)} <span className="text-xs text-gray-400 font-normal">/hari</span></p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-gray-600">Jumlah</div>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 px-3 py-2 border rounded-lg" />
            <div className="text-sm text-gray-600">Hari</div>
            <input type="number" min={1} value={days} onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center">
              <Calendar size={14} className="mr-2" /> Pilih Tanggal Mulai
            </label>
            <input 
              type="date" 
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white font-medium"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Subtotal</p>
                <p className="text-indigo-900 font-black text-xl">{formatRupiah(subtotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Minimal DP ({product.minDp}%)</p>
                <p className="text-indigo-900 font-black text-xl">{formatRupiah(dpAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition order-2 sm:order-1 active:scale-95">
            Batalkan
          </button>
            <button 
              disabled={!date}
              onClick={() => onConfirm({...product, quantity, days}, date)}
              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition order-1 sm:order-2 disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95"
            >
              Bayar & Pesan
            </button>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
      {/* Sidebar - Desktop and Mobile responsive */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-6">
            <User size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900">Ahmad Faisal</h3>
          <p className="text-sm text-gray-400 font-medium">ahmad.faisal@email.com</p>
        </div>
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden p-2 flex lg:flex-col gap-2">
          <button 
            onClick={() => setTab('orders')} 
            className={`flex-1 lg:flex-none text-left px-6 py-4 rounded-2xl flex items-center font-bold text-sm transition ${tab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <History size={20} className="mr-3 shrink-0" /> <span className="truncate">Pesanan Saya</span>
          </button>
          <button 
            onClick={() => setTab('settings')} 
            className={`flex-1 lg:flex-none text-left px-6 py-4 rounded-2xl flex items-center font-bold text-sm transition ${tab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Lock size={20} className="mr-3 shrink-0" /> <span className="truncate">Ganti Password</span>
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-8">
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[500px]">
          {tab === 'orders' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">Aktivitas Booking</h2>
              </div>
              
              {bookings.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">Kamu belum punya riwayat sewa.</p>
                </div>
              )}

              <div className="grid gap-4">
                {bookings.map((item) => (
                  <div key={item.id} className="group bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-gray-900 text-lg leading-none">{item.productName}</h3>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          item.status === 'Booked' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center">
                          <CreditCard size={12} className="mr-1" /> {item.id}
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center">
                          <Calendar size={12} className="mr-1" /> {item.date}
                        </p>
                        {/* Per-item breakdown (quantity × days × price) */}
                        <div className="w-full mt-3">
                          {item.items && item.items.map((it) => (
                            <div key={it.id} className="flex items-center justify-between text-sm text-gray-600 bg-white/30 p-3 rounded-xl mt-2">
                              <div className="truncate">
                                <div className="font-bold text-gray-900">{it.name}</div>
                                <div className="text-xs text-gray-500">{it.quantity} × {it.days} hari × {formatRupiah(it.price)}</div>
                              </div>
                              <div className="font-black text-gray-900">{formatRupiah((parseInt(it.price)||0) * (it.quantity||1) * (it.days||1))}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {item.status === 'Booked' && (
                      <div className="flex gap-2 w-full md:w-auto">
                        {editingId === item.id ? (
                          <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-indigo-100 animate-in slide-in-from-right duration-300">
                            <input type="date" className="text-sm p-2 outline-none border-none bg-transparent" onChange={(e) => setNewDate(e.target.value)} />
                            <button onClick={() => { onReschedule(item.id, newDate); setEditingId(null); }} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition ml-2"><Check size={18} /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition ml-1"><X size={18} /></button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => setEditingId(item.id)}
                              className="flex-1 md:flex-none px-5 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition"
                            >
                              Ubah Jadwal
                            </button>
                            <button 
                              onClick={() => onCancel(item.id)}
                              className="flex-1 md:flex-none px-5 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 active:scale-95 transition"
                            >
                              Batal
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-md">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Ubah Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Password Saat Ini</label>
                  <input type="password" required className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all" value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Password Baru</label>
                  <input type="password" required className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Konfirmasi Password</label>
                  <input type="password" required className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} />
                </div>
                {passMsg && (
                  <div className={`p-4 rounded-2xl text-sm font-bold ${passMsg.includes('berhasil') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {passMsg}
                  </div>
                )}
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB-KOMPONEN ADMIN ---

function AdminDashboard({ products, updateProduct, chartData, bookings }) {
  const [tab, setTab] = useState('dashboard');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [reportType, setReportType] = useState('sales');

  const totalRevenue = bookings.reduce((sum, item) => item.status !== 'Dibatalkan' ? sum + item.total : sum, 0);
  const activeRentals = bookings.filter(b => b.status === 'Booked').length;

  const generateAI = () => {
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      if (reportType === 'sales') {
        setAiResult(`Laporan Analitik Penjualan Cerdas\n\nBulan ini pendapatan Anda mencapai ${formatRupiah(totalRevenue)}. Produk terlaris adalah Kamera Sony dengan tren kenaikan 15% di akhir pekan. Stok Drone DJI mulai menipis, disarankan melakukan penambahan unit.`);
      } else {
        setAiResult(`Proposal Kemitraan Strategis\n\nSewaPro menawarkan model bisnis penyewaan aset dengan GTV sebesar ${formatRupiah(totalRevenue)}. Kami mengundang investor untuk bergabung dalam ekspansi kategori Perlengkapan Outdoor yang memiliki potensi pasar tinggi.`);
      }
      setAiLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
      {/* Sidebar - Desktop and Mobile adaptive */}
      <div className="w-full lg:w-72 space-y-2 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { id: 'inventory', icon: <Package size={20} />, label: 'Inventaris & Harga' },
          { id: 'ai-report', icon: <Sparkles size={20} />, label: 'AI Analyst' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setTab(item.id)} 
            className={`w-full flex items-center px-6 py-4 rounded-2xl font-bold text-sm transition-all ${tab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="mr-4">{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {/* Main Admin Content */}
      <div className="flex-1 space-y-6">
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
                <h3 className="text-3xl font-black text-indigo-600">{formatRupiah(totalRevenue)}</h3>
                <div className="mt-3 inline-flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                  <TrendingUp size={14} className="mr-1" /> +12% MoM
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pesanan Aktif</p>
                <h3 className="text-3xl font-black text-gray-900">{activeRentals} <span className="text-lg font-medium text-gray-400">Unit</span></h3>
                <p className="mt-3 text-xs font-bold text-gray-400">Dalam penyewaan aktif</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sm:col-span-2 xl:col-span-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Inventaris</p>
                <h3 className="text-3xl font-black text-gray-900">{products.length} <span className="text-lg font-medium text-gray-400">SKU</span></h3>
                <p className="mt-3 text-xs font-bold text-gray-400">Terdaftar di katalog</p>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <h3 className="text-xl font-black text-gray-900 mb-8">Statistik Revenue Bulanan</h3>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)', padding: '16px' }} />
                    <Line type="stepAfter" dataKey="revenue" stroke="#4F46E5" strokeWidth={5} dot={{ r: 6, fill: '#4F46E5', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 10, shadow: '0 0 20px indigo' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">Manajemen Inventaris</h3>
                <p className="text-sm text-gray-400 font-medium">Update harga sewa dan nominal DP secara instan.</p>
              </div>
            </div>
            
            {/* Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produk</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sewa/Hari</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Minimal DP</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gambar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr key={p.id} className="group hover:bg-indigo-50/20 transition">
                      <td className="px-8 py-5 font-bold text-gray-900">{p.name}</td>
                      <td className="px-8 py-5">
                        <input 
                          type="number" 
                          className="w-32 px-3 py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold text-indigo-600 bg-gray-50 group-hover:bg-white"
                          value={p.price} 
                          onChange={(e) => updateProduct(p.id, { price: parseInt(e.target.value) })}
                        />
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <input 
                            type="number" 
                            className="w-20 px-3 py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold text-gray-700 bg-gray-50 group-hover:bg-white"
                            value={p.minDp} 
                            onChange={(e) => updateProduct(p.id, { minDp: parseInt(e.target.value) })}
                          />
                          <span className="ml-2 font-bold text-gray-400">%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <img src={p.image} className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm mr-3" />
                          <input 
                            type="text" 
                            className="w-40 px-3 py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-gray-400 bg-gray-50 group-hover:bg-white truncate"
                            value={p.image} 
                            onChange={(e) => updateProduct(p.id, { image: e.target.value })}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'ai-report' && (
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="space-y-1">
                <div className="flex items-center text-indigo-600 font-black uppercase tracking-[0.2em] text-xs">
                  <Sparkles size={16} className="mr-2" /> AI Intelligence Service
                </div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">Smart Report Generator</h3>
              </div>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full md:w-auto">
                <button onClick={() => setReportType('sales')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reportType === 'sales' ? 'bg-white shadow-lg text-indigo-600' : 'text-gray-400'}`}>Sales</button>
                <button onClick={() => setReportType('proposal')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reportType === 'proposal' ? 'bg-white shadow-lg text-indigo-600' : 'text-gray-400'}`}>Proposal</button>
              </div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-6 border-4 border-dashed border-gray-50 rounded-[2.5rem] bg-gray-50/30 text-center">
              {!aiResult && !aiLoading && (
                <div className="max-w-sm">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <FileText size={32} />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Analisis Instan</h4>
                  <p className="text-sm text-gray-400 font-medium mb-8 leading-relaxed">Pilih tipe laporan dan AI kami akan mengolah data transaksi secara otomatis untuk Anda.</p>
                  <button onClick={generateAI} className="px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95">
                    Generate Laporan AI
                  </button>
                </div>
              )}

              {aiLoading && (
                <div className="space-y-6">
                  <div className="flex justify-center gap-1.5">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-75"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-300"></div>
                  </div>
                  <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">Memproses Data Bisnis...</p>
                </div>
              )}

              {aiResult && (
                <div className="w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                         <button onClick={() => setAiResult(null)} className="p-2 text-gray-300 hover:text-gray-500 transition"><X size={20} /></button>
                      </div>
                      <div className="prose prose-indigo max-w-none">
                        <p className="text-gray-700 font-medium leading-loose whitespace-pre-line">{aiResult}</p>
                      </div>
                      <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-center">
                         <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Siap Dibagikan</span>
                         <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Copy to Clipboard</button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
