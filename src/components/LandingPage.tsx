/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { easePremium } from '../motionTokens';
import AnimatedButton from './AnimatedButton';
import { 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  Layers,
  Activity,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Send,
  Warehouse,
  Store,
  Home,
  Building2,
  Crown
} from 'lucide-react';

// Motion design tokens
// Imported easePremium from motionTokens

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easePremium }
  }
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: easePremium }
  }
};

interface LandingPageProps {
  onStartDemo: () => void;
  lang: 'ar' | 'en';
}

export default function LandingPage({ onStartDemo, lang }: LandingPageProps) {
  const isAr = lang === 'ar';
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoStore, setDemoStore] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'support' | 'owner' | 'warehouse'>('support');
  const [scrolled, setScrolled] = useState(false);
  const [hoveredSize, setHoveredSize] = useState<number | null>(null);
  const [hoveredRole, setHoveredRole] = useState<number | null>(null);
  const [hoveredProblem, setHoveredProblem] = useState<number | null>(null);
  const [hoveredHeroCard, setHoveredHeroCard] = useState<'chaos' | 'solution' | null>(null);

  // Monitor scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Demo form submission
  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoName && demoEmail && demoStore) {
      setDemoSubmitted(true);
      setTimeout(() => {
        setDemoSubmitted(false);
        setDemoName('');
        setDemoEmail('');
        setDemoStore('');
        onStartDemo(); // Switch to the active system area
      }, 2500);
    }
  };

  // FAQ items
  const faqItems = isAr ? [
    {
      q: "كيف تساعد منصة حلّها في خفض تكاليف الاسترجاع والاستبدال؟",
      a: "تختصر حلّها عمليات الفحص العشوائي والمحادثات الطويلة المشتتة على واتساب إلى نموذج تفاعلي ذكي يتكامل تلقائياً مع نظام مستودعاتك ودعمك الفني. هذا يمنع قبول المنتجات غير المطابقة ويقلل التدخل البشري بنسبة تصل إلى ٧٠٪."
    },
    {
      q: "هل تدعم المنصة تخصيص سياسة الاسترجاع لكل متجر على حدة؟",
      a: "نعم تماماً. يمكنك إعداد فترات الاسترجاع المسموحة (مثلاً ١٥ يوماً)، وتحديد شروط فحص المستودع وحالات المنتجات المسموح بإعادتها أو استبدالها تلقائياً."
    },
    {
      q: "كيف يتتبع العميل حالة طلبه دون الاتصال بخدمة العملاء؟",
      a: "بمجرد تقديم الطلب عبر البوابة المخصصة للمتجر، يحصل العميل على رقم تتبع مشفر (HAL-xxxx) يتيح له تتبع الخطوات لحظة بلحظة، ومحادثة الدعم بشكل آمن ورفع المرفقات الإضافية."
    },
    {
      q: "ماذا يحدث عند تصعيد الطلب لمالك المتجر؟",
      a: "إذا واجه فريق الدعم حالة معقدة أو طلب العميل استثناءً خارج السياسة، يمكن تصعيد الطلب بضغطة زر لمالك المتجر لمراجعته وإصدار قرار نهائي، مع إخفاء الملاحظات والقرارات الداخلية تماماً عن شاشة العميل للحفاظ على الخصوصية."
    }
  ] : [
    {
      q: "How does Hal'ha help reduce return and exchange costs?",
      a: "Hal'ha condenses manual, chaotic WhatsApp threads into a smart interactive return portal that syncs with your warehouse. This prevents out-of-policy returns and automates up to 70% of operations."
    },
    {
      q: "Can we customize return policies per store?",
      a: "Absolutely. You can define allowed return windows (e.g., 15 days), inspection conditions, and custom rules for returns, exchanges, and customer support escalation."
    },
    {
      q: "How does the customer track their request without support intervention?",
      a: "Customers get a secure tracking ID (HAL-xxxx) upon submission. They can log in to view status updates, exchange messages with support, and upload proof of condition without calling support."
    },
    {
      q: "What happens when a ticket is escalated to the store owner?",
      a: "Complex cases can be escalated securely to the owner. The owner reviews the internal logs and takes action. All internal reasoning, recommendations, and notes are completely hidden from the customer portal."
    }
  ];

  return (
    <div className="bg-[#faf8f5] text-stone-900 min-h-screen selection:bg-teal-100 overflow-x-clip" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* A. NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: easePremium }}
        style={{ top: 'var(--role-selector-height, 56px)' }}
        className={`sticky z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-200/50 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo Motion Reveal */}
            <motion.div 
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative flex items-center justify-center w-9 h-9 bg-teal-600 rounded-xl text-white font-bold text-lg overflow-hidden shadow-md shadow-teal-600/10">
                <motion.span
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: easePremium }}
                >
                  ح
                </motion.span>
                <motion.div 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
              <motion.span 
                initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: easePremium }}
                className="text-lg font-bold tracking-tight text-stone-900 font-sans"
              >
                {isAr ? 'حلّها' : "Hal'ha"}
              </motion.span>
            </motion.div>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
              <a href="#features" className="hover:text-teal-600 transition-colors">{isAr ? 'المزايا' : 'Features'}</a>
              <a href="#how-it-works" className="hover:text-teal-600 transition-colors">{isAr ? 'كيف نعمل' : 'How It Works'}</a>
              <a href="#preview" className="hover:text-teal-600 transition-colors">{isAr ? 'استعراض المنصة' : 'Platform Preview'}</a>
              <a href="#faq" className="hover:text-teal-600 transition-colors">{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <AnimatedButton
              variant="secondary"
              size="md"
              onClick={onStartDemo}
            >
              {isAr ? 'لوحة التحكم التجريبية' : 'Launch Demo Workspace'}
            </AnimatedButton>
            <motion.a
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={{ scale: 0.975 }}
              href="#demo-form"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-teal-600/10"
            >
              {isAr ? 'طلب تجربة حيّة' : 'Request Live Demo'}
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* B. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-28 px-6 overflow-hidden">
        {/* Decorative background shapes with elegant floating animation */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl -z-10 animate-pulse duration-8000" />
        <div className="absolute top-1/3 right-1/10 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl -z-10 animate-pulse duration-6000" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-right">
            
            {/* 1. Brand Label */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easePremium }}
              className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200/50 px-3 py-1 rounded-full text-[10px] font-bold text-teal-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{isAr ? 'بوابة واحدة ذكية لإدارة ما بعد البيع' : 'Unified Intelligence for Post-Purchase Support'}</span>
            </motion.div>

            {/* 2. Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: easePremium }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight font-sans"
            >
              {isAr ? (
                <>
                  من الفوضى الرقمية إلى <br />
                  <span className="text-teal-600">تنظيم وهدوء العمليات</span>
                </>
              ) : (
                <>
                  From Post-Purchase Chaos <br />
                  To <span className="text-teal-600">Structured Workflows</span>
                </>
              )}
            </motion.h1>

            {/* 3. Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.6, ease: easePremium }}
              className="text-stone-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {isAr ? (
                'وداعاً للمحادثات العشوائية وضياع الفواتير. منصة \"حلّها\" هي الحل المتكامل لإدارة طلبات الاسترجاع، الاستبدال، والشكاوى بشكل مؤتمت يجمع مالك المتجر، الدعم الفني، وأخصائي المستودع في شاشة تفاعلية واحدة.'
              ) : (
                "Say goodbye to messy WhatsApp groups and lost receipts. Hal'ha automates your store's returns, size exchanges, and consumer tickets. Connect your support reps, warehouse inspectors, and management under one clear dashboard."
              )}
            </motion.p>

            {/* 4. CTA Buttons with slight stagger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: easePremium }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={onStartDemo}
                className="flex items-center gap-1.5"
              >
                <span>{isAr ? 'ابدأ تجربة النظام الآن' : 'Explore Demo Workspace'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </AnimatedButton>
              
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="#demo-form"
                className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>{isAr ? 'طلب عرض توضيحي مخصص' : 'Request Private Demo'}</span>
              </motion.a>
            </motion.div>

            {/* Micro proof info */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6 }}
              className="text-[10px] text-stone-400 font-mono"
            >
              {isAr ? '✓ لا يتطلب بطاقة ائتمان • تفعيل فوري بلمح البصر' : '✓ No credit card required • Instant dashboard setup'}
            </motion.p>
          </div>

          {/* Hero Right Content - Organized Flow visualizer */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Visual background container for the preview */}
            <div className="relative w-full max-w-lg p-6 bg-stone-100/60 rounded-[32px] border border-stone-200/40 shadow-inner overflow-visible min-h-[440px] md:min-h-[460px]">
              
              {/* Organized Flow Line (Decorative SVG path) */}
              <div className="absolute inset-0 pointer-events-none rounded-[32px] overflow-hidden">
                <svg className="w-full h-full stroke-teal-200/45 fill-none" strokeWidth="2.5">
                  <motion.path 
                    d={isAr ? "M 400 100 Q 250 180 100 320" : "M 100 100 Q 250 180 400 320"}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
                  />
                </svg>
              </div>

              {/* 5. Dashboard preview cards (Scattered becoming organized) */}
              
              {/* Card 1: The Chaos (Incoming messy request) */}
              <motion.div
                onMouseEnter={() => setHoveredHeroCard('chaos')}
                onMouseLeave={() => setHoveredHeroCard(null)}
                initial={{ opacity: 0, scale: 0.6, y: -80, rotate: -15 }}
                animate={{ 
                  opacity: 1,
                  scale: hoveredHeroCard === 'chaos' ? 1.04 : 1,
                  y: hoveredHeroCard === 'chaos' ? -3 : 0,
                  rotate: hoveredHeroCard === 'chaos' ? 0 : -2,
                  borderRadius: hoveredHeroCard === 'chaos' ? "35% 65% 35% 65% / 65% 35% 65% 35%" : "16px",
                  boxShadow: hoveredHeroCard === 'chaos' ? "0 12px 24px -10px rgba(225, 29, 72, 0.15)" : "0 4px 12px -2px rgba(0,0,0,0.05)"
                }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
                className={`absolute top-6 ${isAr ? 'right-6' : 'left-6'} bg-white p-4 border border-rose-200/80 max-w-[270px] md:max-w-[290px] z-10 cursor-pointer transition-colors duration-300 ${hoveredHeroCard === 'chaos' ? 'bg-rose-50/40 border-rose-300' : 'bg-white'}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs shrink-0">⚠️</span>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-rose-500">{isAr ? 'رسالة واتساب غير منظمة' : 'Scattered WhatsApp text'}</p>
                    <p className="text-[11px] font-bold text-stone-900 leading-snug">
                      {isAr ? '«أهلاً، المقاس طلع صغير مرّة وأبغا أرجعه أو أغيره بس الفاتورة ضايعة وش أسوي؟»' : '"Hello, size is too small. I want to return but lost my invoice. Help!"'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-[9px] text-stone-400 font-mono">09:41 AM</span>
                  <span className="text-[8px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">{isAr ? 'تائه وضائع' : 'Unresolved'}</span>
                </div>
              </motion.div>

              {/* Arrow transition indicator */}
              <motion.div 
                animate={{ 
                  scale: hoveredHeroCard ? 1.15 : 1,
                  x: isAr ? [0, -4, 0] : [0, 4, 0]
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 z-20 pointer-events-none"
              >
                {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </motion.div>

              {/* Card 2: The Solution (Organized return request) */}
              <motion.div
                onMouseEnter={() => setHoveredHeroCard('solution')}
                onMouseLeave={() => setHoveredHeroCard(null)}
                initial={{ opacity: 0, scale: 0.6, y: 80, rotate: 15 }}
                animate={{ 
                  opacity: 1,
                  scale: hoveredHeroCard === 'solution' ? 1.04 : 1,
                  y: hoveredHeroCard === 'solution' ? -3 : 0,
                  rotate: hoveredHeroCard === 'solution' ? 0 : 2,
                  borderRadius: hoveredHeroCard === 'solution' ? "65% 35% 65% 35% / 35% 65% 35% 65%" : "16px",
                  boxShadow: hoveredHeroCard === 'solution' ? "0 12px 24px -10px rgba(13, 148, 136, 0.15)" : "0 4px 12px -2px rgba(0,0,0,0.05)"
                }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.5 }}
                className={`absolute bottom-6 ${isAr ? 'left-6' : 'right-6'} bg-white p-4 border border-teal-200/80 max-w-[280px] md:max-w-[310px] z-10 cursor-pointer transition-colors duration-300 ${hoveredHeroCard === 'solution' ? 'bg-teal-50/35 border-teal-300' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
                  <span className="text-[10px] font-bold text-teal-700 font-mono">HAL-1024</span>
                  
                  {/* 6. Status badge inside preview animates gently */}
                  <motion.span 
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-[9px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-100 font-bold"
                  >
                    {isAr ? 'قيد المراجعة الفنية' : 'Under Review'}
                  </motion.span>
                </div>
                
                <div className="space-y-1.5 text-right w-full">
                  <p className="text-[11px] font-bold text-stone-900 leading-snug">
                    {isAr ? 'طلب استبدال: عباية كتان سوداء' : 'Exchange Request: Black Linen Abaya'}
                  </p>
                  <p className="text-[9px] text-stone-400">
                    {isAr ? 'العميل: محمد الشايع • الجوال: *96650' : 'Customer: Mohammed • Mobile: *96650'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 bg-stone-50 p-1.5 rounded-lg border border-stone-100">
                    <span className="text-xs shrink-0">📦</span>
                    <div className="text-[9px] text-right">
                      <p className="font-bold text-stone-700">{isAr ? 'تأكيد المستودع: بحالة ممتازة' : 'Warehouse: Perfect Condition'}</p>
                      <p className="text-stone-400">{isAr ? 'فحص تلقائي سليم' : 'Auto check passed'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </section>

      {/* C. PROBLEM SECTION */}
      <section className="py-24 bg-stone-50 border-y border-stone-200/50 relative px-6 overflow-visible">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200/60 uppercase tracking-wider font-mono">
              {isAr ? 'نزيف العمليات والولاء في المتاجر' : 'The Leaks in Post-Purchase Operations'}
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-stone-900 font-sans leading-tight">
              {isAr ? 'لماذا يعاني العملاء وأصحاب المتاجر؟' : 'Why Customers and Stores Struggle?'}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm max-w-lg mx-auto">
              {isAr ? 'إدارة المرتجعات والمقاسات البديلة بشكل عشوائي تستنزف فريقك وتدمر ثقة المشترين في علامتك التجارية.' : 'Managing returns and size exchanges without a structured system drains profits and breaks shopper loyalty.'}
            </p>
          </div>

          {/* Staggered fade-up cards with squashed circle hover states */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "💬",
                badge: isAr ? "تسريب مالي ووقتي" : "Financial & Time Leak",
                title: isAr ? "تشتت طلبات المرتجعات والمقاسات" : "Scattered Return Requests",
                desc: isAr 
                  ? "تستقبل الطلبات في محادثات واتساب، رسائل إنستغرام، وسناب شات متفرقة، مما يسبب ضياع بيانات العميل وتكرار الأخطاء التشغيلية."
                  : "Requests scatter randomly across WhatsApp, IG comments, and emails, leading to chaotic spreadsheets and lost customer orders.",
                baseRadius: "24px",
                hoverRadius: "45% 55% 45% 55% / 55% 45% 55% 45%"
              },
              {
                icon: "🕵️",
                badge: isAr ? "بضاعة تالفة ومرفوضة" : "Damaged Stock Loss",
                title: isAr ? "غياب معايير الفحص والتوثيق" : "No Standardized Inspection",
                desc: isAr 
                  ? "وصول المرتجع للمستودع دون فحص دقيق أو توثيق بالصور يفتح الباب للنزاعات وقبول منتجات تالفة لا يمكن إعادة بيعها."
                  : "Items arrive back at the warehouse and get processed blindly without photo proof or formal status logs, resulting in bad stock accepting.",
                baseRadius: "24px",
                hoverRadius: "55% 45% 55% 45% / 45% 55% 45% 55%"
              },
              {
                icon: "🤯",
                badge: isAr ? "ضغط وغضب العملاء" : "Customer Agony & Disputes",
                title: isAr ? "فوضى المتابعة وتأخر الاستبدال" : "Delayed Tracking & Disputes",
                desc: isAr 
                  ? "اتصالات متكررة من العملاء للاستفسار عن المقاس البديل، وسط عجز فريق الدعم عن معرفة حالة الشحنة أو مكانها الحالي بدقة."
                  : "Customers call daily demanding updates about their exchanges, while support agents waste hours searching where the parcel is.",
                baseRadius: "24px",
                hoverRadius: "40% 60% 40% 60% / 60% 40% 60% 40%"
              }
            ].map((p, idx) => {
              const isHovered = hoveredProblem === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: isHovered ? -6 : 0,
                    scale: isHovered ? 1.03 : 1
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  onMouseEnter={() => setHoveredProblem(idx)}
                  onMouseLeave={() => setHoveredProblem(null)}
                  transition={{ type: "spring", stiffness: 140, damping: 13, delay: idx * 0.15 }}
                  className={`relative p-8 rounded-3xl border smooth-shadow flex flex-col justify-between min-h-[300px] transition-colors duration-300 overflow-visible cursor-pointer ${isHovered ? 'bg-[#fff5f5] border-rose-300' : 'bg-white border-stone-200/70'}`}
                >
                  <div className="space-y-4 text-right w-full">
                    <div className="flex justify-between items-center">
                      <motion.div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border transition-colors duration-300 ${isHovered ? 'bg-rose-100/80 border-rose-300 text-rose-600' : 'bg-rose-50 border-rose-100/50'}`}
                        animate={{ rotate: isHovered ? [0, 8, -8, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {p.icon}
                      </motion.div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-colors duration-300 uppercase tracking-wide font-mono ${isHovered ? 'bg-rose-100/50 border-rose-300 text-rose-700' : 'bg-stone-100 border-stone-200/60 text-stone-500'}`}>
                        {p.badge}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-stone-900">{p.title}</h3>
                      <p className="text-stone-500 text-[12px] leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                  
                  {/* Small red hint indicator in the bottom corner on hover */}
                  <div className="absolute bottom-4 left-4">
                    <span className={`text-xs font-bold font-sans transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0 text-rose-600' : 'opacity-0 translate-x-2 text-stone-400'}`}>
                      {isAr ? '← تفاصيل المشكلة' : 'Details →'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* D. SOLUTION SECTION */}
      <section className="py-20 relative px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {isAr ? 'الحل المتكامل والأمثل' : 'The Comprehensive and Automated Solution'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              {isAr ? 'منصة حلّها: تنظيم كامل للمرحلة الحية' : "Hal'ha: Complete Post-Purchase Orderly Suite"}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm">
              {isAr ? 'نعيد تنظيم وتدفق العملية في مسار رقمي سلس يحفظ جهود الجميع.' : 'We restructure the post-purchase operation into a clean digital path.'}
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                step: "01",
                title: isAr ? "التحقق والفرز الذكي" : "Smart Verification",
                desc: isAr 
                  ? "التحقق الفوري من رقم الطلب والاتصال المسجل لمنع التلاعب وتوليد محتويات السلة والقطع تلقائياً."
                  : "Instant secure verification of invoice order numbers & phone details to fetch cart products automatically."
              },
              {
                step: "02",
                title: isAr ? "تحديد المسارات بدقة" : "Strict Policy Routing",
                desc: isAr 
                  ? "مسارات منفصلة وواضحة لطلبات الاسترجاع، الاستبدال، والشكاوى لتسريع المعالجة حسب كل فئة."
                  : "Bespoke pathways for Return, Exchange, or general Customer Tickets to route tasks to respective teams instantly."
              },
              {
                step: "03",
                title: isAr ? "الفحص المدعوم بالصور" : "Photo Inspection Logs",
                desc: isAr 
                  ? "أخصائي المستودع يفحص السلعة ويرفق صور الإثبات ويحدد حالتها بدقة ويصنفها لتجنب الخسائر الماليّة."
                  : "Warehouse inspector audits the returned package, uploads physical photos, and logs quality grade for audits."
              },
              {
                step: "04",
                title: isAr ? "التصعيد الآمن والقرارات" : "Secure Escalation Board",
                desc: isAr 
                  ? "تصعيد سري لمالك المتجر في الحالات الاستثنائية ليتخذ القرار الصائب دون تسريب أي بيانات للعميل."
                  : "Private ticket escalation dashboard enabling the store owner to issue definitive decisions securely."
              }
            ].map((sol, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-2xl border border-stone-200/50 shadow-xs relative overflow-hidden transition-all group"
              >
                {/* Visual connecting line indicator at the top */}
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-teal-500/20 to-teal-600/40 group-hover:from-teal-500 group-hover:to-teal-600 transition-all duration-300" />
                <span className="font-mono font-black text-xs text-teal-600/30 group-hover:text-teal-600 block transition-colors">{sol.step}</span>
                <h3 className="text-xs font-bold text-stone-900 mt-2">{sol.title}</h3>
                <p className="text-stone-500 text-[10px] leading-relaxed mt-1">{sol.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* E. HOW IT WORKS SECTION (Interactive Timeline) */}
      <section id="how-it-works" className="py-20 bg-stone-50 border-y border-stone-200/50 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
              {isAr ? 'دورة حياة المعالجة المتكاملة' : 'The Step-by-Step Lifecycle'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 font-sans">
              {isAr ? 'كيف يتم معالجة الطلبات في حلّها؟' : 'How Order Processing works?'}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm">
              {isAr ? 'رحلة تتبع الطلب من التسجيل بالمنصة حتى الإغلاق النهائي للملف.' : 'The structured journey from portal creation to final closure.'}
            </p>
          </div>

          {/* Interactive vertical timeline */}
          <div className="relative border-r border-stone-300 mr-4 md:mr-10 pr-6 md:pr-10 space-y-8">
            {[
              {
                title: isAr ? "١. إنشاء المتجر وتوليد الرابط" : "1. Store Setup & Link Generation",
                role: isAr ? "مدير المنصة (Platform Admin)" : "Platform Admin",
                desc: isAr 
                  ? "يقوم مدير المنصة بإضافة المتجر الجديد وتوليد رابط تفعيل خاص بالتاجر ورابط مخصص لبوابة عملاء المتجر."
                  : "The admin registers the store on the platform and issues the private portal & merchant URLs."
              },
              {
                title: isAr ? "٢. مشاركة بوابة العملاء" : "2. Share Portal link",
                role: isAr ? "التاجر / المتجر الإلكتروني" : "Store/Merchant",
                desc: isAr 
                  ? "يقوم التاجر بوضع رابط بوابة الاسترجاع (حلّها) في تذييل متجره الإلكتروني أو إرساله تلقائياً للعملاء."
                  : "The store integrates the customer portal link in their store's footer or automated notifications."
              },
              {
                title: isAr ? "٣. تقديم الطلب والتحقق" : "3. Customer Submission",
                role: isAr ? "عميل المتجر (Customer)" : "Customer",
                desc: isAr 
                  ? "يدخل العميل بيانات فاتورته، ويختار الإجراء (استرجاع/استبدال/شكوى)، ويرفق صورة للمنتج ثم يستلم رقم التتبع."
                  : "The client verifies their invoice, picks their action type, uploads a photo, and receives HAL-xxxx track ID."
              },
              {
                title: isAr ? "٤. المراجعة الفنية وتحديث الموقف" : "4. Support Review",
                role: isAr ? "فريق الدعم (Customer Support)" : "Customer Support Agent",
                desc: isAr 
                  ? "يفحص دعم العملاء تفاصيل الطلب ويغير الحالة إلى مقبول أو مرفوض أو يطلب المزيد من البيانات أو يقرر تصعيدها."
                  : "The support agent evaluates facts and marks the ticket as approved, rejected, or escalates further."
              },
              {
                title: isAr ? "٥. معالجة حالات التصعيد الاستثنائية" : "5. Handling Escalated Cases",
                role: isAr ? "صاحب المتجر (Store Owner)" : "Store Owner",
                desc: isAr 
                  ? "صاحب المتجر يراجع الحالات الحساسة المرفوعة إليه مع كامل سجل الملاحظات السرية ويتخذ القرار المناسب بشكل مستقل."
                  : "The business owner reviews critical escalated cases privately and issues overrides per custom rules."
              },
              {
                title: isAr ? "٦. فحص وجودة السلعة بالمستودع" : "6. Warehouse Inspection",
                role: isAr ? "أخصائي المستودع (Warehouse Specialist)" : "Warehouse Agent",
                desc: isAr 
                  ? "يستلم المستودع المنتج المادي المرتجع ويقوم بالتقاط صور الفحص وتأكيد سلامته أو تحديد وجود تلف لإرجاعه للمراجعة."
                  : "The warehouse specialist inspects the received package, uploads proof photos, and reports exact physical condition."
              },
              {
                title: isAr ? "٧. تتبع العميل المباشر والإغلاق" : "7. Client Tracking & Close",
                role: isAr ? "العميل والمنصة" : "Client & Platform System",
                desc: isAr 
                  ? "يتتبع العميل الموقف في بوابته لحظة بلحظة، ويحادث فني الدعم حتى يكتمل الطلب بنجاح وتستقر العمليات."
                  : "The customer reviews live updates, chats with support in real time, and the ticket is finalized successfully."
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative space-y-1.5"
              >
                {/* Circle point with slide visual status */}
                <div className="absolute top-1 right-[-31px] md:right-[-47px] w-4 h-4 rounded-full bg-teal-600 border-4 border-white shadow-sm" />
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/50 px-2 py-0.5 rounded-md font-mono">{step.role}</span>
                <h3 className="text-xs font-bold text-stone-900 mt-1">{step.title}</h3>
                <p className="text-stone-500 text-[10px] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* F. FEATURES SECTION */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {isAr ? 'قدرات متقدمة لإدارة مرنة' : 'Advanced Operations Modules'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              {isAr ? 'مصمم لتسهيل المهام اليومية لجميع الأطراف' : 'Designed to facilitate daily tasks for all roles'}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm">
              {isAr ? 'كل ما تحتاجه للتحكم في الطلبات وقرارات المستودع والتصعيد مجمع في واجهة متكاملة.' : 'Everything you need to control requests, warehouse decisions, and support channels.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Layers className="w-5 h-5 text-teal-600" />,
                title: isAr ? "مسارات فحص متعددة الحالات" : "Multi-State Audit Logs",
                desc: isAr 
                  ? "تسجيل دقيق للتسلسل الزمني للطلب مع بيان دقيق للشخص المسؤول عن اتخاذ القرار ومواعيد الاستلام الفعلي في المستودع."
                  : "Detailed timeline logging with precision accountability timestamps and complete audit traces."
              },
              {
                icon: <Activity className="w-5 h-5 text-teal-600" />,
                title: isAr ? "محادثة الدعم المباشرة والمحمية" : "Private Secure Helpdesk Chat",
                desc: isAr 
                  ? "بوابة دردشة للعميل مع الدعم مع عزل كامل للملاحظات والقرارات ومبررات الرفض الداخلية لمالك المتجر لحمايته."
                  : "Integrated customer-to-support messaging channel while isolating secret owner notes safely."
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-teal-600" />,
                title: isAr ? "إثباتات الفحص البصري للمستودع" : "Warehouse Photo Proofing",
                desc: isAr 
                  ? "إرفاق صور المعاينة والفحص فوراً من المستودع وتوثيق المرفقات لتجنب المنازعات وحالات التلاعب التجاري."
                  : "Allows upload of package condition photo evidence right from warehouse docks to avoid customer disputes."
              },
              {
                icon: <Clock className="w-5 h-5 text-amber-600" />,
                title: isAr ? "التحكم في شروط الاستبدال والمقاسات" : "Custom Size Exchange Policies",
                desc: isAr 
                  ? "نظام فريد يساعد متاجر العبايات والملابس والمطاحن في استبدال المقاس والنوع ببديل آخر مع فحص مسبق."
                  : "Unique flow designed for size modifications (like abaya sizes) or mechanical models (like grinders) smoothly."
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
                title: isAr ? "نظام تصعيد هرمي ذكي" : "Hierarchical Ticket Escalation",
                desc: isAr 
                  ? "في الحالات الحساسة أو خارج شروط السياسة يتم إحالة الملف بشكل سري مع مبررات الرفع لمالك المتجر لاتخاذ قرار مستنير."
                  : "Confidential escalation engine to transfer difficult tickets to the business founder for custom overrides."
              },
              {
                icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
                title: isAr ? "أمان كامل وعزل للبيانات التشغيلية" : "Zero Finance / Sync Security",
                desc: isAr 
                  ? "تركيز كامل على تنظيم طلبات ما بعد البيع دون تعقيد أو تشتيت خارج مسار المعالجة."
                  : "Clean procedural management with zero contact with raw payment card data, subscription metrics, or bank transfers."
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                className="p-6 bg-white border border-stone-200/50 rounded-2xl smooth-shadow flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-[#faf8f5] rounded-xl flex items-center justify-center border border-stone-200/40">
                    {f.icon}
                  </div>
                  <h3 className="text-xs font-bold text-stone-900">{f.title}</h3>
                  <p className="text-stone-500 text-[10px] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* G1. SOLUTIONS / STORE SIZES SECTION */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {isAr ? 'حلول مصممة خصيصاً لك' : 'Tailored scale solutions'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              {isAr ? 'حلول دقة مصممة تناسب احتياجك مهما كان نشاطك' : 'Precise solutions tailored to fit your business, whatever its scale'}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm max-w-xl mx-auto">
              {isAr 
                ? 'سواء كنت متجراً ناشئاً، متوسطاً، أو علامة تجارية ضخمة، نوفر لك الأدوات المناسبة لتبسيط دورة حياة طلبات العملاء بكفاءة تامة.'
                : 'Whether you are a startup, a growing medium business, or a massive brand, Hal\'ha equips you to simplify your post-sales returns cleanly.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {[
              {
                title: isAr ? "المتاجر الكبيرة" : "Large Stores",
                desc: isAr 
                  ? "حلول متقدمة وأنظمة مخصصة للعلامات التجارية الكبرى لتبسيط وإدارة تدفقات العمل المعقدة، مع أتمتة دقيقة للمهام لضمان الكفاءة والنمو المستمر."
                  : "Advanced systems for large brands to streamline complex return workflows, with smart automated task routing to guarantee high efficiency and scale.",
                icon: <Building2 className="w-6 h-6 text-blue-600" />,
                bgNormal: "bg-blue-50/40 border-blue-200/50",
                bgHover: "bg-blue-100/70 border-blue-300",
                textColor: "text-blue-900",
                watermark: <Building2 className="absolute bottom-4 right-4 w-32 h-32 text-blue-500/5 pointer-events-none" />,
                baseRadius: "120px 40px 120px 40px",
                hoverRadius: "45% 55% 45% 55% / 55% 45% 55% 45%"
              },
              {
                title: isAr ? "المتاجر المتوسطة" : "Medium Stores",
                desc: isAr 
                  ? "إدارة ذكية ومتكاملة للطلبات والمخزون مع تنظيم أدوار فريق العمل وتوزيع الصلاحيات بكفاءة تضمن التوسع السلس وتجاوب أسرع مع عملائك."
                  : "Complete order, inventory, and staff management to facilitate scaling your operations. Enhance speed, optimize workflows, and maintain beautiful, rapid, and outstanding customer service.",
                icon: <Store className="w-6 h-6 text-amber-600" />,
                bgNormal: "bg-amber-50/30 border-amber-200/50",
                bgHover: "bg-amber-100/60 border-amber-300",
                textColor: "text-amber-900",
                watermark: <Store className="absolute bottom-4 right-4 w-32 h-32 text-amber-500/5 pointer-events-none" />,
                baseRadius: "40px 120px 40px 120px",
                hoverRadius: "55% 45% 55% 45% / 45% 55% 45% 55%"
              },
              {
                title: isAr ? "المتاجر الصغيرة" : "Small Stores",
                desc: isAr 
                  ? "نظم أولى طلباتك وتخلص من الفوضى التشغيلية عبر واجهة مبسطة مصممة خصيصاً لمساعدتك على فحص ومرتجعات عملائك بأقل تكلفة وجهد."
                  : "Systematize return flows and minimize processing friction. Track every client interaction easily, streamline stock replenishment, and ensure an elegant customer experience without setup overhead.",
                icon: <Home className="w-6 h-6 text-emerald-600" />,
                bgNormal: "bg-emerald-50/40 border-emerald-200/50",
                bgHover: "bg-emerald-100/60 border-emerald-300",
                textColor: "text-emerald-900",
                watermark: <Home className="absolute bottom-4 right-4 w-32 h-32 text-emerald-500/5 pointer-events-none" />,
                baseRadius: "120px 40px 120px 40px",
                hoverRadius: "45% 55% 45% 55% / 55% 45% 55% 45%"
              }
            ].map((item, idx) => {
              const isHovered = hoveredSize === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50, scale: 0.9, borderRadius: item.baseRadius }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isHovered ? 1.03 : 1,
                    borderRadius: isHovered ? item.hoverRadius : item.baseRadius
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  onMouseEnter={() => setHoveredSize(idx)}
                  onMouseLeave={() => setHoveredSize(null)}
                  transition={{ type: "spring", stiffness: 140, damping: 13, delay: idx * 0.15 }}
                  className={`p-8 border smooth-shadow relative overflow-visible flex flex-col items-center justify-center min-h-[320px] transition-colors duration-300 ${isHovered ? item.bgHover : item.bgNormal}`}
                >
                  {/* Overflow-hidden wrapper to contain background watermark perfectly without cutting off floating top badge */}
                  <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                    {/* Watermark Logo in background */}
                    <motion.div
                      animate={{ 
                        scale: isHovered ? 1.15 : 1,
                        opacity: isHovered ? 0.08 : 0.04
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.watermark}
                    </motion.div>
                  </div>

                  {/* Top Floating Badge */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border border-stone-200/80 shadow-md flex items-center justify-center z-20">
                    <motion.div
                      animate={{ 
                        rotate: isHovered ? [0, 10, -10, 0] : 0,
                        scale: isHovered ? 1.1 : 1 
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>

                  <div className="space-y-3 relative z-10 text-center mt-4">
                    <h3 className="text-base font-extrabold text-stone-900">{item.title}</h3>
                    <p className="text-stone-500 text-[11px] leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* G. ROLE-BASED SECTION */}
      <section className="py-20 bg-stone-50 border-y border-stone-200/50 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {isAr ? 'شاشات متخصصة لكل صلاحية' : 'Role-Based Operational Areas'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              {isAr ? 'تخصيص الأدوار: بيئة تضمن السيطرة والتركيز' : 'Optimized interface for every store stakeholder'}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm max-w-xl mx-auto">
              {isAr ? 'تم تصميم الواجهات لتناسب طبيعة عمل كل مستخدم في الفريق لزيادة الإنتاجية وتقليل التشتت.' : 'Each user gets a tailored environment to handle their specialized daily tasks with ease.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: isAr ? "١. خدمة دعم العملاء" : "1. Customer Support",
                role: isAr ? "دعم العملاء (Customer Support)" : "Support Agent",
                icon: <MessageSquare className="w-5 h-5 text-teal-600" />,
                points: isAr ? [
                  "فرز الطلبات المجلوبة من بوابة العميل",
                  "مخاطبة العميل واستقبال المرفقات الإضافية",
                  "الموافقة المبدئية أو الرفض أو تصعيد الحالات"
                ] : [
                  "Evaluate incoming tickets from client portals",
                  "Chat with the customer and query additional details",
                  "Grant initial approvals, issue rejections, or escalate"
                ],
                bgNormal: "bg-teal-50/10 border-teal-200/40",
                bgHover: "bg-teal-50/60 border-teal-300",
                watermark: <MessageSquare className="absolute bottom-4 right-4 w-32 h-32 text-teal-500/5 pointer-events-none" />,
                baseRadius: "120px 40px 120px 40px",
                hoverRadius: "45% 55% 45% 55% / 55% 45% 55% 45%"
              },
              {
                title: isAr ? "٢. مالك المتجر الإلكتروني" : "2. Store Owner",
                role: isAr ? "المالك (Store Owner)" : "Owner",
                icon: <Crown className="w-5 h-5 text-amber-600" />,
                points: isAr ? [
                  "مراجعة الطلبات المصعّدة والمثيرة للشكوك",
                  "إصدار قرار نهائي ملزم بالقبول أو الإغلاق",
                  "مراقبة الإحصائيات وسرعة تجاوب الفريق"
                ] : [
                  "Audit sensitive escalated exceptions",
                  "Formulate definitive decisions of approve or reject",
                  "Evaluate metrics and staff performance stats"
                ],
                bgNormal: "bg-amber-50/10 border-amber-200/40",
                bgHover: "bg-amber-50/60 border-amber-300",
                watermark: <ShieldCheck className="absolute bottom-4 right-4 w-32 h-32 text-amber-500/5 pointer-events-none" />,
                baseRadius: "40px 120px 40px 120px",
                hoverRadius: "55% 45% 55% 45% / 45% 55% 45% 55%"
              },
              {
                title: isAr ? "٣. فني المستودع والفحص" : "3. Warehouse Inspector",
                role: isAr ? "المستودع (Warehouse Specialist)" : "Warehouse Inspector",
                icon: <Warehouse className="w-5 h-5 text-stone-600" />,
                points: isAr ? [
                  "فحص سلامة المنتج وتحديد العيوب",
                  "إرفاق صور الإثبات فوراً ومراجعة القطعة",
                  "تأكيد الاستلام أو إرجاع الملف للدعم للمراجعة"
                ] : [
                  "Verify raw parcel condition upon arrival",
                  "Attach visual check photos of defects",
                  "Confirm warehouse pickup or return to support"
                ],
                bgNormal: "bg-stone-50/20 border-stone-200/40",
                bgHover: "bg-stone-100/60 border-stone-300",
                watermark: <Warehouse className="absolute bottom-4 right-4 w-32 h-32 text-stone-500/5 pointer-events-none" />,
                baseRadius: "120px 40px 120px 40px",
                hoverRadius: "45% 55% 45% 55% / 55% 45% 55% 45%"
              }
            ].map((rc, idx) => {
              const isHovered = hoveredRole === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50, scale: 0.9, borderRadius: rc.baseRadius }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isHovered ? 1.03 : 1,
                    borderRadius: isHovered ? rc.hoverRadius : rc.baseRadius
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  onMouseEnter={() => setHoveredRole(idx)}
                  onMouseLeave={() => setHoveredRole(null)}
                  transition={{ type: "spring", stiffness: 140, damping: 13, delay: idx * 0.15 }}
                  className={`p-8 border smooth-shadow relative overflow-visible flex flex-col justify-between min-h-[300px] transition-colors duration-300 ${isHovered ? rc.bgHover : rc.bgNormal}`}
                >
                  {/* Overflow-hidden wrapper to contain background watermark perfectly */}
                  <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                    {/* Watermark Logo in background */}
                    <motion.div
                      animate={{ 
                        scale: isHovered ? 1.15 : 1,
                        opacity: isHovered ? 0.08 : 0.04
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {rc.watermark}
                    </motion.div>
                  </div>

                  <div className="space-y-4 relative z-10 text-right w-full">
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-stone-200/40 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: isHovered ? [0, 10, -10, 0] : 0, scale: isHovered ? 1.1 : 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {rc.icon}
                        </motion.div>
                      </div>
                      <span className="text-[9px] font-bold text-stone-500 bg-stone-200/50 px-2.5 py-1 rounded font-mono">{rc.role}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-stone-900">{rc.title}</h3>
                      <ul className="mt-3 space-y-2">
                        {rc.points.map((p, i) => (
                          <li key={i} className="text-[11px] text-stone-600 flex items-center gap-1.5 justify-start dir-rtl text-right">
                            <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* H. INTERACTIVE PREVIEWS (Customer Mobile & Merchant Desktop) */}
      <section id="preview" className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {isAr ? 'تجربة مستخدم حية' : 'Live Interactive Previews'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              {isAr ? 'استعرض تفاعل بوابات حلّها المترابطة' : 'See how Hal\'ha connects everyone seamlessly'}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm max-w-xl mx-auto">
              {isAr ? 'اضغط لتغيير الأدوار في شريط التنقل العلوي وتجربة لوحة التحكم وبوابة العميل بنفسك!' : 'Try switching roles in the top Demo Mode bar to fully experience all areas!'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Customer Portal Preview Left */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-teal-700 font-mono">CUSTOMER PORTAL</span>
                <h3 className="text-xl font-bold text-stone-900">{isAr ? 'بوابة العميل للهاتف المحمول' : 'Mobile-First Customer Portal'}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  {isAr 
                    ? "نموذج فائق السلاسة يُمكّن العميل من اختيار نوع طلبه وإدخال البيانات وإرفاق الصور وتتبع حالة المعالجة ومحادثة الدعم عبر الجوال."
                    : "A highly responsive layout allowing store clients to start return/exchange flows, write justifications, upload files, and chat in real time."
                  }
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  { label: isAr ? "التحقق الآمن بالفاتورة والجوال" : "Secure SMS/Invoice Lookup", desc: isAr ? "التحقق المباشر يمنع إرسال طلبات عشوائية أو مكررة." : "Strict order matching prevents fraudulent submissions." },
                  { label: isAr ? "اختيار إجراء استرجاع أو استبدال المقاس" : "Return or Size Exchanges", desc: isAr ? "مسار مخصص لاختيار مقاس العباية البديل أو نوع الماكينة." : "Specialized path for selecting correct alternate sizing." },
                  { label: isAr ? "تتبع مباشر ورقم تتبع مشفر" : "Live Step-by-Step Milestones", desc: isAr ? "تحديث حالة الطلب لحظياً مع تظليل المسار المكتمل." : "Real-time updates showing current inspection and reviews." }
                ].map((pt, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200/50 flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                    <div>
                      <h4 className="text-[11px] font-bold text-stone-900">{pt.label}</h4>
                      <p className="text-stone-400 text-[9px] mt-0.5">{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Animated Customer Mobile mockup Right */}
            <div className="lg:col-span-7 flex justify-center">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: easePremium }}
                className="w-full max-w-[310px] aspect-[9/18] bg-[#1c1917] rounded-[48px] p-3.5 shadow-2xl border-4 border-stone-800 relative"
              >
                {/* Speaker pill */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-900 rounded-full z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-stone-800 rounded" />
                </div>

                {/* Inner mobile screen */}
                <div className="w-full h-full bg-[#faf8f5] text-stone-900 rounded-[38px] overflow-hidden p-4 flex flex-col justify-between pt-8 text-right font-sans relative">
                  
                  {/* Small header bar inside mockup */}
                  <div className="flex justify-between items-center text-[9px] text-stone-400 font-mono border-b border-stone-100 pb-2 mb-2">
                    <span>9:41 AM</span>
                    <span className="font-bold text-teal-700">{isAr ? 'نجد للقهوة' : 'Najd Coffee'}</span>
                    <span>5G 🔋</span>
                  </div>

                  {/* Body preview (Mock Step animation loop) */}
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="bg-teal-900 text-white p-3.5 rounded-xl text-[9px] text-center font-bold">
                      {isAr ? 'أهلاً بك في البوابة الموحدة لمراجعة طلباتك' : 'Welcome to return & exchange portal'}
                    </div>

                    <div className="border border-stone-200 bg-white p-2.5 rounded-xl shadow-xs space-y-1">
                      <p className="text-[9px] font-bold text-stone-400">{isAr ? 'خطوة ١: نوع الإجراء' : 'Step 1: Choose Action'}</p>
                      
                      {/* Interactive choice highlighter effect */}
                      <div className="space-y-1">
                        <motion.div 
                          animate={{ backgroundColor: ['#ffffff', '#f0fdf4', '#ffffff'] }}
                          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                          className="p-1.5 border border-emerald-100 rounded-lg text-[9px] font-bold text-emerald-800 flex items-center justify-between"
                        >
                          <span>🔄 {isAr ? 'استبدال مقاس العباية / المنتج' : 'Exchange Size/Product'}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </motion.div>
                        <div className="p-1.5 border border-stone-100 rounded-lg text-[9px] text-stone-500">
                          💳 {isAr ? 'طلب استرجاع المنتج' : 'Return Request'}
                        </div>
                        <div className="p-1.5 border border-stone-100 rounded-lg text-[9px] text-stone-500">
                          ⚠️ {isAr ? 'تقديم شكوى أو تأخر توصيل' : 'File Delivery Complaint'}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center text-[9px]">
                      <p className="font-bold text-stone-700">{isAr ? 'تتبع طلبك' : 'Track your status'}</p>
                      <p className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-1">HAL-1024</p>
                    </div>
                  </div>

                  {/* Micro simulated CTA button */}
                  <button className="w-full bg-teal-600 text-white font-bold py-2 rounded-xl text-[10px] cursor-not-allowed">
                    {isAr ? 'متابعة الخطوات والتحقق ←' : 'Proceed to Verification →'}
                  </button>

                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* J. CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-teal-900 via-stone-900 to-stone-950 text-white relative overflow-hidden px-6">
        
        {/* Subtle decorative background gradient loop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.1),transparent_40%)]" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-teal-400"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'تثبيت مجاني بالكامل للنموذج الأولي' : 'Full Free Sandbox Interactive Prototype'}</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight font-sans">
            {isAr ? 'أعد تنظيم عمليات متجرك في أقل من دقيقة' : 'Regain complete control over your store return logs'}
          </h2>
          <p className="text-teal-100/70 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            {isAr 
              ? "جرّب نموذج المحاكاة التفاعلية المتكامل لجميع الأدوار (المالك، الدعم، والمستودع) وشاهد كيف تسير الأمور بسلاسة وأمان بدون أي تكاليف."
              : "Experience the fully interactive simulated client & merchant flow right now. See how easily return tracking and ticket overrides operate."
            }
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartDemo}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-stone-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <span>{isAr ? 'الدخول لواجهة العمل فوراً' : 'Enter Dashboard Workspace'}</span>
              <ArrowLeft className="w-4 h-4 text-stone-950" />
            </motion.button>
            <a
              href="#demo-form"
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              {isAr ? 'طلب معاينة حيّة للمبيعات' : 'Talk to Post-Sales Expert'}
            </a>
          </div>
        </div>
      </section>

      {/* K. DEMO REQUEST FORM */}
      <section id="demo-form" className="py-20 px-6 max-w-lg mx-auto">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-md relative overflow-hidden">
          
          <div className="text-center mb-6 space-y-1">
            <h3 className="text-lg font-bold text-stone-900 font-sans">{isAr ? 'طلب تجربة حيّة وحجز موعد استشارة' : 'Book a Live Custom Demo'}</h3>
            <p className="text-xs text-stone-500">{isAr ? 'املأ البيانات لنستعرض معك المنصة وطريقة الربط في دقيقة.' : 'Fill the fields and our product team will walk you through.'}</p>
          </div>

          <AnimatePresence mode="wait">
            {demoSubmitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-emerald-900">{isAr ? 'تم استقبال طلبك بنجاح!' : 'Request Received Successfully!'}</h4>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {isAr 
                    ? 'نشكر اهتمامك بمنصة حلّها. جاري إدخالك الآن تلقائياً إلى مساحة العمل التجريبية الحية لتصفح النظام بكل حرية.'
                    : 'Thank you for your interest. You are being redirected to the interactive sandbox workspace.'
                  }
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleDemoSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1 text-right">
                  <label className="block text-xs font-bold text-stone-700">{isAr ? 'اسمك الكريم' : 'Your Name'}</label>
                  <input 
                    type="text" 
                    required
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    placeholder={isAr ? 'عبدالرحمن محمد' : 'Abdulrahman Mohammed'}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-stone-50 text-right focus:bg-white transition"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1 text-right">
                  <label className="block text-xs font-bold text-stone-700">{isAr ? 'البريد الإلكتروني للعمل' : 'Work Email'}</label>
                  <input 
                    type="email" 
                    required
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="name@store.sa"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-stone-50 text-right focus:bg-white transition"
                    dir="ltr"
                  />
                </div>

                {/* Store Name */}
                <div className="space-y-1 text-right">
                  <label className="block text-xs font-bold text-stone-700">{isAr ? 'اسم متجرك الحالي' : 'Store Name'}</label>
                  <input 
                    type="text" 
                    required
                    value={demoStore}
                    onChange={(e) => setDemoStore(e.target.value)}
                    placeholder={isAr ? 'نجد للقهوة المختصة' : 'Najd Specialty Coffee'}
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-stone-50 text-right focus:bg-white transition"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-xs font-bold transition shadow-md shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرسال ودخول مساحة العمل' : 'Submit & Enter Workspace'}</span>
                </motion.button>

              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* L. FAQ SECTION */}
      <section id="faq" className="py-20 bg-stone-50 border-t border-stone-200/50 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {isAr ? 'إجابات على تساؤلاتكم' : 'Frequently Asked Questions'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              {isAr ? 'الأسئلة الشائعة حول منصة حلّها' : 'Questions & Answers'}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm">
              {isAr ? 'كل ما تحتاج معرفته عن دورة معالجة المرتجعات وسياسة الفحص وعزل البيانات.' : 'Everything you need to know about out-of-the-box operations and data isolation.'}
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs transition-colors duration-300"
                >
                  {/* Accordion header button with icon rotation */}
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-xs text-stone-900 cursor-pointer focus:outline-none select-none"
                  >
                    <span>{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: easePremium }}
                      className="text-stone-400 shrink-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  {/* Accordion content expansion */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: easePremium }}
                      >
                        <div className="px-5 pb-5 pt-1 text-[11px] text-stone-500 leading-relaxed border-t border-stone-100">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
