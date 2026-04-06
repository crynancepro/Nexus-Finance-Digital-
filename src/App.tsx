/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutTemplate, 
  Rocket, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart, 
  CheckCircle2, 
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Quote,
  Star,
  ChevronDown,
  Globe,
  Palette,
  Code2,
  Zap,
  Menu,
  X,
  Smartphone,
  Server,
  Wifi,
  Plus,
  Minus,
  Navigation,
  Handshake,
  Wallet,
  ShieldCheck,
  Search,
  Filter,
  HelpCircle,
  DollarSign,
  Euro,
  Send,
  Trophy,
  BookOpen,
  BarChart3,
  Brain,
  Award,
  Monitor,
  Calendar,
  Clock,
  Play,
  FileText,
  Mail,
  Phone,
  Check,
  Crown,
  Users,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useAnimationFrame } from 'motion/react';
import * as React from 'react';
import { useState, useEffect, useRef, Component } from 'react';

import { 
  onSnapshot,
  doc
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  setDoc, 
  getDoc, 
  addDoc,
  collection, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot as onFirestoreSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      let errorMessage = "Une erreur inattendue est survenue.";
      try {
        // @ts-ignore
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) {
          errorMessage = `Erreur Firestore: ${parsed.error} (Opération: ${parsed.operationType})`;
        }
      } catch (e) {
        // @ts-ignore
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1e222d] border border-[#f23645]/30 p-8 rounded-3xl text-center">
            <ShieldAlert className="w-16 h-16 text-[#f23645] mx-auto mb-6" />
            <h2 className="text-2xl font-display font-black text-white mb-4">Oups ! Quelque chose s'est mal passé.</h2>
            <p className="text-[#d1d4dc] text-sm mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-[#2962ff] text-white rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

// --- Types ---
interface Option {
  id: string;
  label: string;
  price: number;
  roi?: string;
}

interface PricingCardProps {
  title: string;
  price: number;
  priceLabel: string;
  icon: any;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

interface Option {
  id: string;
  label: string;
  price: number;
}

// --- Modal Component ---
// Removed as it was only used for auth messages.

// --- Components ---

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border border-[#2962ff] rounded-full pointer-events-none z-[9999] hidden lg:block mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />
  );
};

const MarketTicker = () => {
  const metrics = [
    { label: "XAU/USD", value: "2,324.50", change: "+1.24%", up: true },
    { label: "EUR/USD", value: "1.0842", change: "-0.15%", up: false },
    { label: "GBP/USD", value: "1.2634", change: "+0.08%", up: true },
    { label: "BTC/USD", value: "67,432.10", change: "+2.45%", up: true },
    { label: "USD/JPY", value: "151.64", change: "-0.32%", up: false },
    { label: "NAS100", value: "18,234.50", change: "+0.85%", up: true },
    { label: "ROI MOYEN ÉLÈVE", value: "+15.5%", change: "UP", up: true },
    { label: "TRADERS FINANCÉS", value: "150+", change: "LIVE", up: true },
  ];

  const [isPaused, setIsPaused] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    if (isPaused) return;
    
    const speed = 50; // pixels per second
    const moveBy = (speed * delta) / 1000;
    
    x.set(x.get() - moveBy);

    if (containerRef.current) {
      const halfWidth = containerRef.current.scrollWidth / 2;
      if (Math.abs(x.get()) >= halfWidth) {
        x.set(0);
      }
    }
  });

  return (
    <div 
      className="w-full bg-[#0a0a0f] border-b border-[#363a45] py-2 overflow-hidden relative z-[70]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div 
        ref={containerRef}
        style={{ x, willChange: 'transform' }}
        className="flex whitespace-nowrap"
      >
        {[...metrics, ...metrics].map((metric, i) => (
          <div key={i} className="flex items-center gap-4 px-8 border-r border-[#363a45]/30">
            <span className="text-[9px] font-black text-[#d1d4dc] uppercase tracking-[0.2em]">{metric.label}</span>
            <span className={`text-[10px] font-bold flex items-center gap-1 ${metric.up ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {metric.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {metric.value}
              <span className="text-[8px] opacity-60 ml-1">{metric.change}</span>
            </span>
          </div>
        ))}
      </motion.div>
      
      {/* Edge Fades for smoother visual transition */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
    </div>
  );
};


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-4 md:px-6 py-4 ${scrolled ? 'translate-y-0' : 'translate-y-2'}`}>
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2962ff] via-blue-400 to-[#2962ff] origin-left z-[110] shadow-[0_0_10px_rgba(41,98,255,0.5)]"
          style={{ scaleX }}
        />
        
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-2xl border border-[#363a45]/50 bg-[#1e222d]/40 backdrop-blur-2xl px-8 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[#2962ff]/20 py-2' : ''}`}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  className="w-10 h-10 bg-[#2962ff] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(41,98,255,0.3)] group-hover:shadow-[0_0_30px_rgba(41,98,255,0.5)] transition-all"
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-display font-black text-2xl tracking-tighter text-white">Nexus<span className="text-[#2962ff]"> Finance Digital</span></span>
              </div>
              <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131722]/80 border border-[#363a45]/50 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-[#089981] animate-pulse shadow-[0_0_10px_rgba(8,153,129,0.5)]" />
                <span className="text-[10px] font-black text-[#089981] uppercase tracking-[0.2em]">Marché en Direct</span>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-10 text-[11px] font-black text-[#d1d4dc] uppercase tracking-[0.25em]">
              {[
                { id: 'services', label: 'Services Web' },
                { id: 'web-training', label: 'Formation Web' },
                { id: 'academy', label: 'Formation Trading' },
                { id: 'faq', label: 'Support' }
              ].map((item) => (
                <a 
                  key={item.id}
                  href={`#${item.id}`} 
                  className="relative hover:text-white transition-colors group py-2"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2962ff] transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            <button className="lg:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 left-4 right-4 lg:hidden p-8 rounded-3xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-2xl z-40 shadow-2xl"
            >
              <div className="flex flex-col gap-6 text-center font-bold text-lg text-white">
                <a href="#services" onClick={() => setIsOpen(false)} className="py-2 hover:text-[#2962ff] transition-colors">Services Web</a>
                <a href="#web-training" onClick={() => setIsOpen(false)} className="py-2 hover:text-[#2962ff] transition-colors">Formation Web IA</a>
                <a href="#academy" onClick={() => setIsOpen(false)} className="py-2 hover:text-[#2962ff] transition-colors">Formation Trading</a>
                <a href="#faq" onClick={() => setIsOpen(false)} className="py-2 hover:text-[#2962ff] transition-colors">Support</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

const AnimatedBackground = () => {
  const { scrollY } = useScroll();
  const y1 = useSpring(scrollY, { stiffness: 100, damping: 30 });
  const y2 = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base Image Background */}
      <motion.div 
        style={{ y: y2 }}
        className="absolute inset-0 opacity-20"
      >
        <img 
          src="https://esca.ma/hubfs/L%20intelligence%20artificielle%20permet-elle%20de%20renforcer%20la%20confiance%20en%20soi.jpg" 
          alt="Innovation Technologique" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#131722] via-transparent to-[#131722]" />
      </motion.div>

      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#2962ff]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#2962ff]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#363a45 1px, transparent 1px), linear-gradient(90deg, #363a45 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Moving Chart Line */}
      <svg className="absolute bottom-0 left-0 w-full h-64 opacity-10" preserveAspectRatio="none">
        <motion.path
          d="M0,100 Q100,50 200,100 T400,100 T600,50 T800,100 T1000,50 T1200,100 T1400,50 T1600,100"
          fill="none"
          stroke="#2962ff"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};


const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-grain" />
);


const StatsCounter = () => {
  const stats = [
    { label: "Traders Formés", value: 150, suffix: "+" },
    { label: "ROI Moyen Mensuel", value: 15, suffix: "%" },
    { label: "Taux de Réussite", value: 85, suffix: "%" },
    { label: "Satisfaction", value: 100, suffix: "%" }
  ];

  return (
    <section className="py-16 md:py-24 border-y border-[#363a45]/30 bg-[#131722]/50">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto px-4 md:px-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center group"
          >
            <div className="text-3xl md:text-6xl font-black text-white mb-2 md:mb-3 tracking-tighter group-hover:text-[#2962ff] transition-colors">
              <Counter value={stat.value} />
              <span className="text-[#2962ff]">{stat.suffix}</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-[#d1d4dc] uppercase tracking-[0.3em] group-hover:text-white transition-colors">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Counter = ({ value, decimal = false }: { value: number, decimal?: boolean }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView.current) {
          isInView.current = true;
          let start = 0;
          const end = value;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = (t: number) => t * (2 - t);
            const currentCount = start + (end - start) * easeOutQuad(progress);
            
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{decimal ? count.toFixed(1) : Math.floor(count)}</span>;
};

const PricingCard = ({ title, price, priceLabel, icon: Icon, features, isPopular = false, currency = 'XOF' }: any) => {
  const [hasClickedWave, setHasClickedWave] = useState(false);

  const getPrice = () => {
    if (priceLabel === "Sur Devis" || priceLabel.includes('+')) return priceLabel;
    if (currency === 'EUR') return (price / 655).toFixed(0) + ' €';
    if (currency === 'USD') return (price / 600).toFixed(0) + ' $';
    return price.toLocaleString() + ' F';
  };

  const handleWaveClick = () => {
    setHasClickedWave(true);
    window.open('https://pay.wave.com/m/M_sn_wXlszdyVZOIV/c/sn/', '_blank');
  };

  const handleWhatsAppConfirm = async () => {
    const message = encodeURIComponent(`Bonjour Peter, je viens de payer pour le pack ${title}. Voici mon reçu.`);
    window.open(`https://wa.me/221775783443?text=${message}`, '_blank');
  };

  const performance = (title === "Starter" || title === "Basic") ? "+15%" : title === "Business Pro" ? "+45%" : "+120%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -10,
        rotateX: 2,
        rotateY: -2,
        scale: 1.02
      }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`relative group p-6 md:p-10 rounded-3xl border border-[#363a45]/50 bg-[#1e222d] backdrop-blur-sm flex flex-col h-full transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] hover:border-[#2962ff]/30 ${
        isPopular ? 'ring-1 ring-[#2962ff]/50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-10" style={{ transform: 'translateZ(20px)' }}>
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#2962ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6 md:w-7 md:h-7 text-[#2962ff]" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] md:text-[10px] font-black text-[#089981] uppercase tracking-[0.2em] mb-1">ROI Estimé</span>
          <span className="text-lg md:text-xl font-black text-[#089981]">{performance}</span>
        </div>
      </div>

      {isPopular && (
        <div className="absolute -top-3 left-10 bg-[#2962ff] text-white text-[9px] md:text-[10px] font-black px-6 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(41,98,255,0.3)] z-20">
          Recommandé
        </div>
      )}
      
      <div className="mb-10" style={{ transform: 'translateZ(30px)' }}>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight text-wrap break-words text-balance hyphens-auto">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-black text-white">{getPrice()}</span>
          <span className="text-[9px] md:text-[10px] font-black text-[#d1d4dc] uppercase tracking-[0.2em]">/ Projet</span>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-[#363a45] via-[#363a45] to-transparent mb-10" />

      <ul className="space-y-4 md:space-y-5 mb-12 flex-grow" style={{ transform: 'translateZ(10px)' }}>
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start gap-3 md:gap-4 text-[#d1d4dc] text-xs md:text-sm leading-relaxed group/item">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#2962ff]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-[#2962ff]/20 transition-colors">
              <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#2962ff]" />
            </div>
            <span className="group-hover/item:text-white transition-colors font-medium text-balance hyphens-auto">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-4">
        <motion.button 
          onClick={handleWaveClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-5 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg"
        >
          <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Payer avec Wave
        </motion.button>

        <motion.button 
          onClick={handleWhatsAppConfirm}
          disabled={!hasClickedWave}
          whileHover={hasClickedWave ? { scale: 1.02 } : {}}
          whileTap={hasClickedWave ? { scale: 0.98 } : {}}
          className={`w-full py-5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg ${
            hasClickedWave 
              ? 'bg-[#089981] hover:bg-[#067d6a] text-white animate-pulse shadow-[0_0_20px_rgba(8,153,129,0.3)]' 
              : 'bg-[#363a45] text-[#d1d4dc] opacity-50 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          J'ai payé ✅ (WhatsApp)
        </motion.button>
      </div>
    </motion.div>
  );
};

const AcademyPricingCard = ({ pack, index }: any) => {
  const [hasClickedWave, setHasClickedWave] = useState(false);
  
  const handleWaveClick = () => {
    setHasClickedWave(true);
    window.open('https://pay.wave.com/m/M_sn_wXlszdyVZOIV/c/sn/', '_blank');
  };

  const handleWhatsAppConfirm = async () => {
    const message = encodeURIComponent(`Bonjour Peter, je viens de payer pour le pack ${pack.title}. Voici mon reçu.`);
    window.open(`https://wa.me/221775783443?text=${message}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 md:p-10 rounded-[40px] border transition-all relative overflow-hidden group flex flex-col ${
        pack.popular ? 'border-[#2962ff] bg-[#1e222d] shadow-[0_0_50px_rgba(41,98,255,0.1)]' : 'border-[#363a45]/50 bg-[#1e222d]'
      }`}
    >
      {pack.popular && (
        <div className="absolute top-6 right-6 px-4 py-1 rounded-full bg-[#2962ff] text-white text-[9px] font-black uppercase tracking-widest">
          Plus Populaire
        </div>
      )}
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-wrap break-words text-balance hyphens-auto">{pack.title}</h3>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-3xl md:text-4xl font-black text-white">{pack.price} F</span>
        <span className="text-[#d1d4dc] text-[10px] font-bold uppercase tracking-widest">/ cursus</span>
      </div>
      <p className="text-[#d1d4dc] text-xs md:text-sm mb-8 font-medium leading-relaxed text-balance hyphens-auto">{pack.desc}</p>
      <ul className="space-y-3 md:space-y-4 mb-10 flex-grow">
        {pack.features.map((f: string, j: number) => (
          <li key={j} className="flex items-center gap-3 text-[11px] md:text-xs text-[#d1d4dc] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#089981]" />
            <span className="text-balance hyphens-auto">{f}</span>
          </li>
        ))}
      </ul>

      {pack.title === "Diamond" && (
        <div className="mb-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffd700]/10 border border-[#ffd700]/20 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
          <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ffd700]" />
          <span className="text-[#ffd700] text-[9px] font-black uppercase tracking-widest">Badge Certifié Or</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Button 1: Wave */}
        <motion.button
          onClick={handleWaveClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-5 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg"
        >
          <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Payer avec Wave
        </motion.button>

        {/* Button 2: WhatsApp */}
        <motion.button
          onClick={handleWhatsAppConfirm}
          disabled={!hasClickedWave}
          whileHover={hasClickedWave ? { scale: 1.02 } : {}}
          whileTap={hasClickedWave ? { scale: 0.98 } : {}}
          className={`w-full py-5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg ${
            hasClickedWave 
              ? 'bg-[#089981] hover:bg-[#067d6a] text-white animate-pulse shadow-[0_0_20px_rgba(8,153,129,0.3)]' 
              : 'bg-[#363a45] text-[#d1d4dc] opacity-50 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          J'ai payé ✅ (WhatsApp)
        </motion.button>
      </div>
    </motion.div>
  );
};

const TradingAcademy = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextSession, setNextSession] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('nextSessionAt', 'asc'), limit(1));
    const unsubscribe = onFirestoreSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setNextSession(snapshot.docs[0].data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sessions');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let targetDate: Date;

      if (nextSession?.nextSessionAt) {
        targetDate = nextSession.nextSessionAt.toDate();
      } else {
        // Fallback logic
        const sessionDays = [2, 3, 5, 6]; // Tue, Wed, Fri, Sat
        let targetDay = sessionDays.find(day => {
          if (day > now.getDay()) return true;
          if (day === now.getDay() && (now.getHours() < 19 || (now.getHours() === 19 && now.getMinutes() < 30))) return true;
          return false;
        });

        if (targetDay === undefined) targetDay = sessionDays[0];
        
        const daysUntil = (targetDay + 7 - now.getDay()) % 7;
        targetDate = new Date();
        targetDate.setDate(now.getDate() + (daysUntil === 0 && (now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() >= 30)) ? 7 : daysUntil));
        targetDate.setHours(19, 30, 0, 0);
      }

      const difference = targetDate.getTime() - now.getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [nextSession]);

  const packs = [
    {
      title: "Standard Elite",
      price: "45 000",
      desc: "Maîtrisez le SMC/ICT + Analyse Fondamentale (Impact des news FED/BCE).",
      features: ["Formation Complète", "Accès Groupe Privé", "Sessions Live 4x/sem", "Analyse Fondamentale"],
      color: "#d1d4dc",
      popular: false
    },
    {
      title: "Mentorat Gold",
      price: "85 000",
      desc: "Formation complète + Compte Prop Firm 5 000 $ offert. Idéal pour trader avec un capital réel.",
      features: ["Formation Complète", "Compte Prop Firm 5k", "Mentorat Live 4x/sem", "Plan de Trading Pro"],
      color: "#2962ff",
      popular: true
    },
    {
      title: "Mentorat Diamond",
      price: "150 000",
      desc: "Coaching VIP + Compte Prop Firm 10 000 $ offert. L'excellence pour les traders d'élite.",
      features: ["Mentorat VIP Peter", "Compte Prop Firm 10k", "Sessions 1-on-1", "Accès Algorithmes Privés"],
      color: "#ffd700",
      popular: false
    }
  ];

  const schedule = [
    { day: "Mardi", time: "19h30 - 21h30" },
    { day: "Mercredi", time: "19h30 - 21h30" },
    { day: "Vendredi", time: "19h30 - 21h30" },
    { day: "Samedi", time: "19h30 - 21h30" }
  ];

  const gains = [
    "Moussa : +15 000 F via l'affiliation + 1er retrait Prop Firm réussi !",
    "Fatou : Compte 5 000 $ validé en 12 jours ! Merci Nexus Finance Digital.",
    "Abdou : Analyse SMC maîtrisée, +8% sur XAU/USD cette semaine.",
    "Samba : Discipline retrouvée, fini l'overtrading !",
    "Mariama : Premier retrait de 250 $ reçu sur Wave.",
    "Ibrahima : Stratégie ICT redoutable sur le JPY.",
    "Awa : Accompagnement au top pour l'évaluation Prop Firm.",
    "Cheikh : +12 000 F de commissions d'affiliation encaissés.",
    "Ousmane : Maîtrise totale du calendrier économique NFP.",
    "Khady : Gestion du risque à 1% par trade, capital préservé.",
    "Modou : Structure de marché enfin claire grâce au Module 2.",
    "Seynabou : Objectif 5 000 $ atteint ! En route pour les 10k.",
    "Babacar : Nexus Finance Digital Academy a changé ma vision du trading."
  ];

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Bonjour Nexus Finance Digital ! Je souhaite réserver ma place pour la session de Mardi et rejoindre la Trading Academy.");
    window.open(`https://wa.me/221775783443?text=${message}`, '_blank');
  };

  return (
    <section id="academy" className="py-32 relative overflow-hidden bg-[#131722]">
      {/* Background Candlestick Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {[...Array(30)].map((_, i) => (
            <g key={i}>
              <rect x={i * 35 + 10} y={200 + Math.random() * 400} width="1" height={100 + Math.random() * 200} fill={i % 2 === 0 ? "#089981" : "#f23645"} />
              <rect x={i * 35} y={250 + Math.random() * 300} width="15" height={50 + Math.random() * 100} fill={i % 2 === 0 ? "#089981" : "#f23645"} />
            </g>
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-6 py-2 mb-6 rounded-full bg-[#2962ff]/10 border border-[#2962ff]/20 text-[#2962ff] text-[10px] font-black uppercase tracking-[0.4em]"
          >
            Nexus Finance Digital Trading Academy
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black mb-8 text-white tracking-tighter leading-none text-wrap break-words text-balance hyphens-auto">
            Formation <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] to-[#089981]">Trading</span>
          </h2>
          
          {/* Live Countdown */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="px-6 py-3 rounded-2xl bg-[#f23645]/10 border border-[#f23645]/20 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-[#f23645] animate-pulse shadow-[0_0_10px_rgba(242,54,69,0.5)]" />
              <span className="text-[#f23645] font-black text-xs uppercase tracking-widest">
                Prochaine session en direct : {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packs.map((pack, i) => (
            <AcademyPricingCard key={i} pack={pack} index={i} />
          ))}
        </div>

        <div className="text-center mb-24">
          <p className="text-[#d1d4dc] text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
            L'activation de votre accès est manuelle et prend environ 15 minutes après réception du message WhatsApp.
          </p>
        </div>

        {/* Course Planning & Live Trading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-12 rounded-[40px] border border-[#363a45]/50 bg-[#1e222d]/50 backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#089981]/10 flex items-center justify-center">
                <Monitor className="w-8 h-8 text-[#089981]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Cours Pratiques</h3>
                <p className="text-[#089981] text-[10px] font-black uppercase tracking-widest">Live Trading & Analyse</p>
              </div>
            </div>
            <p className="text-[#d1d4dc] mb-8 font-medium leading-relaxed">
              Nous travaillons sur du concret. Chaque session est une immersion totale dans les graphiques réels pour appliquer les stratégies institutionnelles en temps réel.
            </p>
            <div className="space-y-4">
              {schedule.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#131722] border border-[#363a45]/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#2962ff]" />
                    <span className="text-white font-bold text-sm">{s.day}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#d1d4dc]" />
                    <span className="text-[#d1d4dc] font-medium text-sm">{s.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[10px] text-[#d1d4dc] uppercase tracking-widest opacity-50 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Heure de Dakar • Format En Ligne
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-12 rounded-[40px] border border-[#2962ff]/30 bg-gradient-to-br from-[#1e222d] to-[#131722] flex flex-col justify-center items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2962ff]/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-[#2962ff]/10 flex items-center justify-center mx-auto mb-8">
                <Trophy className="w-10 h-10 text-[#2962ff]" />
              </div>
              <h3 className="text-3xl font-black text-white mb-6 tracking-tight">Objectif 5 000 $ Prop Firm</h3>
              <p className="text-[#d1d4dc] text-lg font-medium leading-relaxed mb-8">
                Accompagnement personnel pour gérer un capital de <span className="text-[#2962ff] font-black">5 000 $</span>. Inscription validée dès réception du dépôt Wave.
              </p>
              
              <div className="flex flex-col items-center gap-4 mb-10">
                {/* Wave Payment Mention */}
                <div className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 w-full">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Wave_Logo.svg/1200px-Wave_Logo.svg.png" alt="Wave" className="w-full h-auto" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">Paiement via Wave</p>
                    <p className="text-[#d1d4dc] text-[10px] font-medium">Validation instantanée après dépôt</p>
                  </div>
                </div>

                {/* Certified Badge */}
                <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffd700]/10 border border-[#ffd700]/20 shadow-[0_0_15px_rgba(255,215,0,0.1)] w-full justify-center">
                  <Award className="w-5 h-5 text-[#ffd700]" />
                  <span className="text-[#ffd700] text-[10px] font-black uppercase tracking-widest">Trader Certifié Nexus Finance Digital</span>
                </div>
              </div>

              <motion.button
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-6 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(41,98,255,0.3)] flex items-center justify-center gap-4 group"
              >
                Réserver ma place pour Mardi
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Gains Marquee */}
        <div className="py-12 border-y border-[#363a45]/30 overflow-hidden relative">
          <div className="flex whitespace-nowrap animate-ticker">
            {[...gains, ...gains].map((gain, i) => (
              <div key={i} className="inline-flex items-center gap-4 px-12 border-r border-[#363a45]/30">
                <div className="w-2 h-2 rounded-full bg-[#089981]" />
                <span className="text-[#d1d4dc] font-black text-[10px] uppercase tracking-[0.2em]">{gain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const MissionSection = () => {
  const pillars = [
    {
      title: "Analyse Institutionnelle",
      desc: "Maîtrisez les concepts SMC et ICT pour trader comme les banques et les grandes institutions.",
      icon: BarChart3,
      detail: "Smart Money Concepts",
      color: "#2962ff"
    },
    {
      title: "Mentorat & Live",
      desc: "Sessions en direct 4 fois par semaine pour analyser le marché et prendre des trades ensemble.",
      icon: Monitor,
      detail: "Live Trading 19h30",
      color: "#089981"
    },
    {
      title: "Accès aux Capitaux",
      desc: "Nous vous accompagnons pour valider vos évaluations Prop Firm et gérer jusqu'à 5 000$.",
      icon: Trophy,
      detail: "Prop Firm Funding",
      color: "#ffd700"
    },
    {
      title: "Psychologie Pro",
      desc: "Développez la discipline et la gestion émotionnelle nécessaires pour devenir rentable à long terme.",
      icon: ShieldCheck,
      detail: "Mindset de Gagnant",
      color: "#f7525f"
    }
  ];

  return (
    <section id="services" className="py-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#2962ff] to-transparent" />
      
      <div className="text-center mb-16 md:mb-24 px-4">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-[10px] font-black text-[#2962ff] uppercase tracking-[0.5em] mb-4 block"
        >
          Notre Double Expertise
        </motion.span>
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-white tracking-tighter text-wrap break-words">
          L'Ingénierie du <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] to-blue-400">Succès</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4 md:px-6">
        {pillars.map((pillar, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative p-10 rounded-3xl border border-[#363a45]/50 bg-[#1e222d]/30 backdrop-blur-sm hover:border-[#2962ff]/30 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2962ff]/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: `${pillar.color}15` }}
              >
                <pillar.icon className="w-8 h-8" style={{ color: pillar.color }} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{pillar.title}</h3>
              <p className="text-[#d1d4dc] leading-relaxed mb-8 text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                {pillar.desc}
              </p>
              
              <div className="flex items-center gap-3 pt-6 border-t border-[#363a45]/30">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pillar.color }} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{pillar.detail}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};


const LimitedOfferBanner = () => (
  <div className="bg-[#2962ff] text-white py-2 px-4 text-center text-[10px] md:text-xs font-black uppercase tracking-[0.2em] relative z-[60] shadow-2xl">
    <span className="animate-pulse">🔥 Offre Spéciale : -15% sur tous les packs pour les 3 prochains clients !</span>
    <span className="ml-4 border-l border-white/30 pl-4 hidden md:inline">Code: NEXUS15</span>
  </div>
);

const WorkSteps = () => {
  const steps = [
    { title: "Apprentissage Théorique", desc: "Maîtrise des concepts fondamentaux et des stratégies institutionnelles SMC/ICT.", icon: Search },
    { title: "Pratique en Direct", desc: "Application des connaissances lors des sessions de Live Trading à 19h30.", icon: Palette },
    { title: "Financement & Profit", desc: "Passage des évaluations Prop Firm et début de la gestion de capitaux réels.", icon: Rocket }
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <span className="text-[#2962ff] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Notre Méthodologie</span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black mb-8 text-white tracking-tighter text-wrap break-words">Processus de Haute Précision</h2>
          <p className="text-[#d1d4dc] max-w-2xl mx-auto text-lg md:text-xl font-medium text-balance">Une rigueur mathématique appliquée à chaque pixel de votre projet.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[40px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#363a45] to-transparent z-0" />
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1e222d] border border-[#363a45] flex items-center justify-center mb-8 md:mb-10 group-hover:border-[#2962ff] transition-all shadow-2xl glow-tradingview relative">
                <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2962ff] text-white text-xs md:text-sm font-black flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <step.icon className="w-8 h-8 md:w-10 md:h-10 text-[#2962ff]" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold mb-4 md:mb-6 text-white tracking-tight text-wrap break-words">{step.title}</h3>
              <p className="text-[#d1d4dc] text-xs md:text-sm leading-relaxed font-medium px-4 text-balance">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { 
      q: "La formation Trading est-elle adaptée aux débutants ?", 
      a: "Absolument. Nos cursus sont conçus pour vous guider de zéro jusqu'aux stratégies institutionnelles SMC/ICT les plus avancées. Nous privilégions la pratique réelle sur les graphiques." 
    },
    { 
      q: "Combien de temps faut-1 pour la création de mon site web ?", 
      a: "Pour un site vitrine standard, comptez entre 5 et 10 jours ouvrables. Pour un site E-commerce complexe avec IA intégrée, le délai est généralement de 15 à 20 jours selon vos besoins spécifiques." 
    },
    { 
      q: "Qu'apprend-on dans la formation Création de Site Web ?", 
      a: "Vous apprendrez à utiliser les meilleurs outils d'IA pour générer du code, du design et du contenu. Nous couvrons le responsive design, l'optimisation SEO et l'intégration de systèmes de paiement comme Wave." 
    },
    { 
      q: "Comment fonctionne l'accompagnement Prop Firm ?", 
      a: "Nous vous fournissons les stratégies et le plan de trading nécessaires pour passer les évaluations. Peter vous accompagne personnellement lors des sessions live pour valider vos objectifs de 5 000 $ ou 10 000 $." 
    },
    { 
      q: "Quels sont les modes de paiement acceptés ?", 
      a: "Nous acceptons principalement Wave pour sa rapidité et sa sécurité. Nous acceptons également Orange Money, les virements bancaires et les paiements en espèces sur rendez-vous à Dakar." 
    },
    { 
      q: "Comment puis-je obtenir de l'aide après mon achat ?", 
      a: "Chaque pack inclut un support dédié via WhatsApp. Pour les formations, vous rejoignez également nos groupes privés pour un échange constant avec la communauté et les mentors." 
    }
  ];

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#131722]">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black text-[#2962ff] uppercase tracking-[0.5em] mb-4 block"
          >
            Support & Aide
          </motion.span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-tighter text-wrap break-words">
            Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] to-blue-400">Fréquentes</span>
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl md:rounded-3xl border border-[#363a45]/50 bg-[#1e222d] overflow-hidden backdrop-blur-sm"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
              >
                <span className="text-base md:text-lg font-bold text-white tracking-tight group-hover:text-[#2962ff] transition-colors pr-4 text-wrap break-words text-balance hyphens-auto">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#2962ff] transition-transform duration-500 shrink-0 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 md:px-8 pb-6 md:pb-8"
                  >
                    <p className="text-[#d1d4dc] text-xs md:text-sm leading-relaxed font-medium pt-4 border-t border-[#363a45]/20 text-balance hyphens-auto">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


const FloatingWhatsApp = () => (
  <motion.a
    href="https://wa.me/221775783443"
    target="_blank"
    rel="noopener noreferrer"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.1 }}
    className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#089981] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 group"
  >
    <MessageCircle className="w-7 h-7 text-white" />
    <div className="absolute inset-0 rounded-full bg-[#089981] animate-ping opacity-20" />
    <div className="absolute right-full mr-4 bg-[#1e222d] text-white border border-[#363a45] px-4 py-2 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
      Besoin d'aide ?
    </div>
  </motion.a>
);

const TestimonialCard = ({ name, role, content, rating }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="p-10 rounded-xl border border-[#363a45] bg-[#1e222d] shadow-xl flex flex-col relative group hover:border-[#2962ff]/30 transition-all"
  >
    <div className="absolute top-8 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
      <Quote className="w-16 h-16 text-[#2962ff]" />
    </div>
    
    <div className="flex gap-1 mb-6 relative z-10">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#2962ff] text-[#2962ff]" />
      ))}
    </div>

    <p className="text-[#d1d4dc] text-lg leading-relaxed mb-10 relative z-10 font-medium italic text-balance hyphens-auto">
      "{content}"
    </p>

    <div className="flex items-center gap-5 mt-auto relative z-10">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2962ff] to-blue-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/20">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-white text-lg tracking-tight text-balance hyphens-auto">{name}</h4>
        <p className="text-[10px] text-[#2962ff] font-black uppercase tracking-[0.2em]">{role}</p>
      </div>
    </div>
  </motion.div>
);

const InfiniteScrollBanner = ({ items, direction = 'left', type = 'client' }: any) => {
  const [isPaused, setIsPaused] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    if (isPaused) return;
    
    const speed = 40; // pixels per second
    const moveBy = (speed * delta) / 1000;
    
    if (direction === 'left') {
      x.set(x.get() - moveBy);
    } else {
      x.set(x.get() + moveBy);
    }

    // Loop logic
    if (containerRef.current) {
      const halfWidth = containerRef.current.scrollWidth / 2;
      if (direction === 'left' && Math.abs(x.get()) >= halfWidth) {
        x.set(0);
      } else if (direction === 'right' && x.get() >= 0) {
        x.set(-halfWidth);
      }
    }
  });

  useEffect(() => {
    if (direction === 'right' && containerRef.current) {
      x.set(-containerRef.current.scrollWidth / 2);
    }
  }, [direction]);

  return (
    <div 
      className="relative overflow-hidden py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div 
        ref={containerRef}
        style={{ x }}
        className="flex gap-6 w-max px-6"
      >
        {[...items, ...items].map((item, i) => (
          <div 
            key={i}
            className="p-5 rounded-xl border border-[#363a45] bg-[#1e222d] min-w-[220px] md:min-w-[320px] shadow-xl transition-all hover:border-[#2962ff]/30 hover:bg-[#1e222d]/80 group"
          >
            {type === 'client' ? (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#2962ff]/10 flex items-center justify-center group-hover:bg-[#2962ff]/20 transition-colors">
                  <Star className="w-4 h-4 text-[#2962ff]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-0.5">
                    {item.split(':')[0]}
                  </p>
                  <p className="text-[#d1d4dc] text-[11px] font-medium italic">
                    "{item.split(':')[1]}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#089981]/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#089981]" />
                  </div>
                  <p className="text-white font-bold text-sm">
                    {item.split(':')[0]}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[#089981] font-black text-sm block">
                    {item.split(':')[1]}
                  </span>
                  <span className="text-[9px] font-bold text-[#d1d4dc] uppercase tracking-widest">Commission</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </motion.div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-[#131722] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-[#131722] to-transparent z-10 pointer-events-none" />
    </div>
  );
};


export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const path = 'contact_messages';
    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', whatsapp: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-[#2962ff] uppercase tracking-[0.5em] mb-4 block">Contactez-nous</span>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter">Parlons de votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] to-blue-400">Projet</span></h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-[40px] border border-[#363a45]/50 bg-[#1e222d]/50 backdrop-blur-xl shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#d1d4dc] uppercase tracking-widest ml-2">Nom Complet</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-[#131722] border border-[#363a45] text-white focus:border-[#2962ff] focus:ring-1 focus:ring-[#2962ff] transition-all outline-none"
                  placeholder="Votre nom"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#d1d4dc] uppercase tracking-widest ml-2">Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-[#131722] border border-[#363a45] text-white focus:border-[#2962ff] focus:ring-1 focus:ring-[#2962ff] transition-all outline-none"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#d1d4dc] uppercase tracking-widest ml-2">WhatsApp</label>
              <input 
                required
                type="tel" 
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-[#131722] border border-[#363a45] text-white focus:border-[#2962ff] focus:ring-1 focus:ring-[#2962ff] transition-all outline-none"
                placeholder="+221 ..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#d1d4dc] uppercase tracking-widest ml-2">Message</label>
              <textarea 
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-[#131722] border border-[#363a45] text-white focus:border-[#2962ff] focus:ring-1 focus:ring-[#2962ff] transition-all outline-none resize-none"
                placeholder="Comment pouvons-nous vous aider ?"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                isSuccess ? 'bg-[#089981] text-white' : 'bg-[#2962ff] hover:bg-[#1e53e5] text-white'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Message Envoyé !
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer le Message
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

function AppContent() {
  const [currency, setCurrency] = useState<'XOF' | 'EUR' | 'USD'>('XOF');
  const [showOffer, setShowOffer] = useState(true);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const cardX = useSpring(useMotionValue(0), { damping: 50, stiffness: 400 });
  const cardY = useSpring(useMotionValue(0), { damping: 50, stiffness: 400 });
  const cardRotateX = useSpring(useMotionValue(0), { damping: 50, stiffness: 400 });
  const cardRotateY = useSpring(useMotionValue(0), { damping: 50, stiffness: 400 });

  const handleMouseMove = (e: any) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  const webCreationServices = [
    {
      title: "Basique",
      price: 32500,
      priceLabel: "32 500",
      icon: LayoutTemplate,
      features: ["Site One-Page", "Design Responsive", "Lien WhatsApp", "Hébergement 1 an", "Support 1 mois"],
      buttonText: "Commander"
    },
    {
      title: "Standard",
      price: 65000,
      priceLabel: "65 000",
      icon: Globe,
      features: ["Site Vitrine (5 pages)", "SEO Optimisé", "Formulaire Contact", "Design Personnalisé", "Support 3 mois"],
      buttonText: "Commander",
      isPopular: true
    },
    {
      title: "Business",
      price: 125000,
      priceLabel: "125 000",
      icon: Rocket,
      features: ["Site E-commerce / Pro", "Paiements Intégrés", "IA Chatbot Basique", "Formation Gestion", "Support 6 mois"],
      buttonText: "Commander"
    }
  ];

  const webTrainingPacks = [
    {
      title: "Starter IA",
      price: 25000,
      priceLabel: "25 000",
      icon: LayoutTemplate,
      features: ["Créer des Landing Pages IA", "Vitesse & Performance", "Bases de l'IA Web", "Optimisation SEO", "Support 3 mois"],
      buttonText: "Démarrer"
    },
    {
      title: "Business Pro",
      price: 45000,
      priceLabel: "45 000",
      icon: Rocket,
      features: ["Site Vitrine Complet IA", "SEO IA Avancé", "Design Premium", "Intégration WhatsApp", "Support 6 mois"],
      buttonText: "Choisir",
      isPopular: true
    },
    {
      title: "E-commerce Elite",
      price: 75000,
      priceLabel: "75 000",
      icon: ShoppingCart,
      features: ["Boutique en ligne IA", "Intégration Paiement Wave", "Paiement OM Intégré", "Chatbot IA Intégré", "Gestion de Stock"],
      buttonText: "Lancer ma boutique"
    }
  ];

  const testimonials = [
    { name: "Moussa Diop", role: "Trader Indépendant", content: "La formation SMC a changé ma vision des marchés. J'ai validé mon premier compte Prop Firm en 2 semaines.", rating: 5 },
    { name: "Fatou Sow", role: "Étudiante Academy", content: "Les lives de 19h30 sont incroyables. On apprend en voyant Peter analyser le marché en direct.", rating: 5 },
    { name: "Ibrahima Ndiaye", role: "Trader Pro", content: "Un accompagnement sérieux et une stratégie ICT redoutable. Le meilleur investissement de ma carrière.", rating: 5 }
  ];

  const clientReviews = [
    "Moussa : Site vitrine livré en 5 jours ! Nexus Finance Digital est au top.",
    "Fatou : Ma boutique E-commerce tourne à merveille. Merci Peter.",
    "Abdou : Le chatbot IA a doublé mes conversions.",
    "Samba : Design incroyable et ultra-rapide.",
    "Mariama : Accompagnement business exceptionnel.",
    "Ibrahima : Mon application web est parfaite.",
    "Awa : SEO efficace, je suis en 1ère page.",
    "Cheikh : Un service pro et percutant.",
    "Ousmane : IA intégrée bluffante.",
    "Khady : Support client très réactif.",
    "Modou : Meilleur rapport qualité/prix à Dakar.",
    "Seynabou : Vision transformée en réalité.",
    "Babacar : Nexus Finance Digital a boosté mon entreprise.",
    "Aminata : Site responsive parfait sur mobile.",
    "Saliou : Expertise technique indéniable."
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#131722] text-white font-sans selection:bg-[#2962ff]/30 overflow-x-hidden"
    >
      <CustomCursor />
      <MarketTicker />
      <GrainOverlay />
      {showOffer && <LimitedOfferBanner />}
      <Navbar />
      <FloatingWhatsApp />

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 flex flex-col items-center text-center">
          <AnimatedBackground />
          
          {/* Floating Financial Card */}
          <motion.div
            style={{
              x: cardX,
              y: cardY,
              rotateX: cardRotateX,
              rotateY: cardRotateY,
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              // Update motion values here if needed, but for simplicity we'll use static hover
            }}
            whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5 }}
            className="absolute top-20 right-[-5%] hidden xl:block w-72 p-6 rounded-2xl border border-[#2962ff]/30 bg-[#1e222d]/80 backdrop-blur-xl shadow-2xl z-20 pointer-events-auto cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded bg-[#2962ff] flex items-center justify-center shadow-lg shadow-blue-600/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#089981] uppercase tracking-widest">Performance</div>
                <div className="text-xl font-black text-white">+124.5%</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-1.5 w-full bg-[#131722] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#2962ff] to-blue-400"
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#d1d4dc] uppercase tracking-widest">
                <span>Optimisation</span>
                <span className="text-white">85%</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#363a45] flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1e222d] bg-[#363a45] overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-bold text-[#d1d4dc] uppercase tracking-widest">Clients Actifs</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex items-center gap-3 px-4 py-2 mb-8 rounded-full bg-[#1e222d] border border-[#363a45] backdrop-blur-md shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
              <span className="text-[10px] font-bold text-[#089981] uppercase tracking-widest">Marché Ouvert</span>
            </div>
            <div className="w-px h-3 bg-[#363a45]" />
            <span className="text-[10px] font-bold text-[#d1d4dc] uppercase tracking-widest">150+ Traders Formés au Sénégal</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 inline-block px-6 py-2 mb-8 rounded-full bg-[#2962ff]/10 border border-[#2962ff]/20 text-[#2962ff] text-[10px] font-black uppercase tracking-[0.4em]"
          >
            L'Élite du Trading & du Web-IA au Sénégal
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-2xl sm:text-3xl lg:text-5xl font-display font-black mb-8 tracking-tighter leading-[0.9] text-white text-wrap break-words text-balance hyphens-auto"
          >
            Nexus<span className="text-[#2962ff]"> Finance Digital</span> <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] via-[#60a5fa] to-[#2962ff] drop-shadow-[0_0_40px_rgba(41,98,255,0.4)]">Dakar</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10 text-[#d1d4dc] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed mb-12 font-medium text-balance px-4 hyphens-auto"
          >
            Nexus Finance Digital : L'intersection entre la Finance d'élite et le Web-IA. Nous transformons votre vision en actifs rentables grâce à notre expertise technologique et financière.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto px-4"
          >
            <a href="#services" className="w-full sm:w-auto px-12 py-4 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded font-bold uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 glow-tradingview group">
              Créer mon site
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#academy" className="w-full sm:w-auto px-12 py-4 bg-[#1e222d] hover:bg-[#363a45] border border-[#363a45] text-white rounded font-bold uppercase tracking-widest transition-all backdrop-blur-sm flex items-center justify-center">
              Formation Trading
            </a>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Découvrir</span>
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-white/10 flex justify-center p-1"
            >
              <div className="w-1 h-2 bg-[#2962ff] rounded-full" />
            </motion.div>
          </motion.div>
        </section>

        <StatsCounter />

        {/* Section 1: Création de Sites Web Professionnels */}
        <section id="services" className="py-24 md:py-32 bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16 md:mb-24">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-[10px] font-black text-[#2962ff] uppercase tracking-[0.5em] mb-4 block"
              >
                Expertise Digitale
              </motion.span>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-black text-white mb-8 tracking-tighter text-wrap break-words text-balance hyphens-auto">
                Création de Sites Web <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] to-blue-400">Professionnels</span>
              </h2>
              <p className="text-[#d1d4dc] max-w-2xl mx-auto text-lg md:text-xl font-medium text-balance hyphens-auto">
                Confiez-nous la création de votre image de marque digitale. Des solutions sur mesure pour chaque entreprise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {webCreationServices.map((pack, index) => (
                <PricingCard key={index} {...pack} currency={currency} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Formation Création de Site Web IA */}
        <section id="web-training" className="py-24 md:py-32 bg-[#131722] border-t border-[#363a45]/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16 md:mb-24">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-[10px] font-black text-[#2962ff] uppercase tracking-[0.5em] mb-4 block"
              >
                Apprentissage Futuriste
              </motion.span>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-black text-white mb-8 tracking-tighter text-wrap break-words text-balance hyphens-auto">
                Formation Création de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2962ff] to-blue-400">Site Web IA</span>
              </h2>
              <p className="text-[#d1d4dc] max-w-2xl mx-auto text-lg md:text-xl font-medium text-balance hyphens-auto">
                Maîtrisez les outils d'intelligence artificielle pour créer des sites web percutants en un temps record.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {webTrainingPacks.map((pack, index) => (
                <PricingCard key={index} {...pack} currency={currency} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Formation de Trading */}
        <TradingAcademy />

        <WorkSteps />

        <section className="py-12 space-y-4">
          <div className="text-center mb-8">
            <h3 className="text-[10px] font-bold text-[#2962ff] uppercase tracking-[0.3em]">La Voix de nos Clients</h3>
          </div>
          <InfiniteScrollBanner items={clientReviews} direction="left" type="client" />
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-black text-white mb-4 tracking-tight">L'Avis de nos Clients</h2>
            <p className="text-gray-400">La réussite de nos partenaires est notre plus grande fierté.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </section>

        <FAQAccordion />
        <ContactSection />


        {/* Final CTA & Footer */}
        <footer className="py-16 md:py-24 border-t border-[#363a45] bg-[#131722] mt-24 md:mt-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 mb-16 md:mb-24">
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#2962ff] rounded flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-display font-extrabold text-2xl md:text-3xl tracking-tighter text-white uppercase">Nexus<span className="text-[#2962ff]"> Finance Digital</span></span>
                </div>
                <p className="text-[#d1d4dc] text-sm md:text-base font-medium leading-relaxed text-balance">
                  L'agence digitale et académie de trading de haute précision à Dakar. 
                  Nous fusionnons la technologie web et l'analyse financière pour bâtir votre succès.
                </p>
                <div className="flex gap-4">
                  <a href="https://www.tiktok.com/@petertrader0?_r=1&_t=ZN-95CiTui49fa" target="_blank" className="w-12 h-12 rounded bg-[#1e222d] border border-[#363a45] flex items-center justify-center hover:border-[#2962ff] transition-all shadow-xl group">
                    <Navigation className="w-5 h-5 text-[#d1d4dc] group-hover:text-[#2962ff] transition-colors" />
                  </a>
                  <a 
                    href="https://t.me/+Ui1HUO5q6EE4NWI0" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded bg-[#1e222d] border border-[#363a45] flex items-center justify-center hover:border-[#2962ff] transition-all shadow-xl group"
                  >
                    <Send className="w-5 h-5 text-[#d1d4dc] group-hover:text-[#2962ff] transition-colors" />
                  </a>
                  <a 
                    href="https://wa.me/221775783443" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded bg-[#1e222d] border border-[#363a45] flex items-center justify-center hover:border-[#089981] transition-all shadow-xl group"
                  >
                    <MessageCircle className="w-5 h-5 text-[#d1d4dc] group-hover:text-[#089981] transition-colors" />
                  </a>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] text-white">Expertise & Contact</h4>
                <ul className="space-y-5 text-sm text-[#d1d4dc] font-bold uppercase tracking-widest">
                  <li className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded bg-[#2962ff]/10 flex items-center justify-center group-hover:bg-[#2962ff]/20 transition-colors">
                      <Navigation className="w-4 h-4 text-[#2962ff]" />
                    </div>
                    Ouakam, Dakar, Sénégal
                  </li>
                  <li className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded bg-[#2962ff]/10 flex items-center justify-center group-hover:bg-[#2962ff]/20 transition-colors">
                      <Smartphone className="w-4 h-4 text-[#2962ff]" />
                    </div>
                    +221 77 578 34 43
                  </li>
                  <li className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded bg-[#2962ff]/10 flex items-center justify-center group-hover:bg-[#2962ff]/20 transition-colors">
                      <Globe className="w-4 h-4 text-[#2962ff]" />
                    </div>
                    www.nexus-finance-digital.sn
                  </li>
                </ul>
              </div>

              <div className="space-y-8">
                {/* Performance Academy en Direct */}
                <div className="pt-0 border-t-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black text-[#d1d4dc] uppercase tracking-widest">Performance Academy</span>
                    <span className="text-[9px] font-black text-[#089981] uppercase tracking-widest animate-pulse">En Direct</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white">Traders Financés</span>
                      <span className="text-[#2962ff]">85%</span>
                    </div>
                    <div className="h-1 w-full bg-[#1e222d] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2962ff] w-[85%]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white">XAU/USD Signal</span>
                      <span className="text-[#089981]">Gagnant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-[#363a45] text-[#d1d4dc] text-[10px] font-bold uppercase tracking-[0.2em]">
              <p>Propulsé par Nexus Finance Digital - Dakar</p>
              <div className="flex gap-10">
                <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
                <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
