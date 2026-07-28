'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, BarChart3, GitBranch, Target, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import { useRef } from 'react';

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'AI-Powered Gap Detection',
    description: 'Compare your profile against thousands of real job descriptions. Know exactly which skills are blocking you.',
    color: '#436E57',
    iconBg: 'rgba(67,110,87,0.08)',
    iconBorder: 'rgba(67,110,87,0.15)',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Transparent Scoring',
    description: 'Every score has an explanation. 6 weighted components, zero hallucinations. Your score is always backed by evidence.',
    color: '#5EBE7A',
    iconBg: 'rgba(94,190,122,0.08)',
    iconBorder: 'rgba(94,190,122,0.15)',
  },
  {
    icon: <GitBranch className="w-5 h-5" />,
    title: 'GitHub & Coding Analysis',
    description: 'Connect LeetCode, Codeforces, and GitHub. We analyze your projects, languages, and problem-solving depth.',
    color: '#6EC5FF',
    iconBg: 'rgba(110,197,255,0.08)',
    iconBorder: 'rgba(110,197,255,0.15)',
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: 'Personalized Roadmap',
    description: 'A week-by-week learning plan with project ideas that directly improve your placement readiness score.',
    color: '#FFD57C',
    iconBg: 'rgba(255,213,124,0.08)',
    iconBorder: 'rgba(255,213,124,0.15)',
  },
];

const STATS = [
  { value: '15+', label: 'Target Roles Supported' },
  { value: '5', label: 'Score Components' },
  { value: '1000s', label: 'JDs Analyzed' },
  { value: '100%', label: 'Explainable AI' },
];

const STEPS = [
  {
    step: '01',
    title: 'Build Your Profile',
    description: 'Upload your resume, connect GitHub, link your LeetCode — our AI extracts the full picture of your skills.',
  },
  {
    step: '02',
    title: 'AI Runs the Analysis',
    description: 'We compare your profile against curated job descriptions for your target role and identify every gap.',
  },
  {
    step: '03',
    title: 'Get Your Action Plan',
    description: 'Receive a personalized score, skill gap report, and a week-by-week roadmap with project recommendations.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function ScoreRingDemo() {
  const score = 73;
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGradientDemo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#436E57" />
            <stop offset="100%" stopColor="#5EBE7A" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#scoreGradientDemo)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-2xl font-display font-bold" style={{ color: '#436E57' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          {score}
        </motion.span>
        <span className="text-xs" style={{ color: '#6B7280' }}>Score</span>
      </div>
    </div>
  );
}

function HeroVisualization() {
  const skills = [
    { name: 'React', match: 90, color: '#436E57' },
    { name: 'Node.js', match: 75, color: '#5B866E' },
    { name: 'PostgreSQL', match: 60, color: '#6EC5FF' },
    { name: 'Docker', match: 20, color: '#E05B5B' },
    { name: 'Redis', match: 10, color: '#E05B5B' },
  ];

  return (
    <motion.div
      className="bg-white border border-gray-100 rounded-2xl shadow-card p-6 w-full max-w-sm"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Full Stack Developer</p>
          <p className="text-sm font-display font-semibold mt-0.5" style={{ color: '#1E1E1F' }}>Placement Readiness</p>
        </div>
        <ScoreRingDemo />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Skill Match vs JD</p>
        {skills.map((skill, i) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: '#1E1E1F' }}>{skill.name}</span>
              <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{skill.match}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: skill.color }}
                initial={{ width: 0 }}
                animate={{ width: `${skill.match}%` }}
                transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
      <motion.div
        className="mt-4 p-3 rounded-xl flex items-start gap-2.5"
        style={{ background: 'rgba(224,91,91,0.06)', border: '1px solid rgba(224,91,91,0.15)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
      >
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#E05B5B' }} />
        <div>
          <p className="text-xs font-medium" style={{ color: '#E05B5B' }}>Critical Gap: Docker</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Appears in 82% of Full Stack JDs</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-100" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #436E57, #5B866E)' }}>
              <span className="text-white font-display font-bold text-sm">P</span>
            </div>
            <span className="font-display font-semibold text-lg" style={{ color: '#1E1E1F' }}>PlacementIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm transition-colors hover:text-primary" style={{ color: '#4B5563' }}>Features</Link>
            <Link href="#how-it-works" className="text-sm transition-colors hover:text-primary" style={{ color: '#4B5563' }}>How it Works</Link>
            <Link href="#pricing" className="text-sm transition-colors hover:text-primary" style={{ color: '#4B5563' }}>Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm px-4 py-2 rounded-xl border border-gray-200 bg-white transition-all hover:bg-gray-50" style={{ color: '#4B5563' }}>Sign in</Link>
            <Link href="/login" className="btn-primary text-sm px-4 py-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative pt-32 pb-20 px-6 overflow-hidden">
        <motion.div className="max-w-7xl mx-auto" style={{ opacity: heroOpacity, y: heroY }}>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div className="flex-1 text-center lg:text-left" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6" style={{ borderColor: 'rgba(67,110,87,0.2)', background: 'rgba(67,110,87,0.06)', color: '#436E57' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#436E57' }} />
                AI-Powered Placement Intelligence
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.05] mb-6" style={{ color: '#1E1E1F' }}>
                Know Exactly What<br />
                <span style={{ color: '#436E57' }}>Stands Between You</span><br />
                and Your Dream Job.
              </motion.h1>
              <motion.p variants={itemVariants} className="text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed" style={{ color: '#4B5563' }}>
                PlacementIQ analyzes your resume, GitHub, and coding profiles against thousands of real job descriptions — and tells you exactly what&apos;s missing.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Link href="/login" className="btn-primary px-8 py-3.5 text-base font-semibold w-full sm:w-auto">
                  Analyze My Profile Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#how-it-works" className="px-8 py-3.5 text-base w-full sm:w-auto rounded-xl border border-gray-200 bg-white transition-all hover:bg-gray-50 text-center font-medium" style={{ color: '#4B5563' }}>
                  See How it Works
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3 mt-8 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (<div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ background: `hsl(${140 + i * 20}, 40%, ${55 + i * 5}%)` }} />))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />))}
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>Trusted by 2,000+ students</span>
              </motion.div>
            </motion.div>
            <div className="flex-shrink-0"><HeroVisualization /></div>
          </div>
        </motion.div>
      </section>

      <section className="py-12 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <div className="text-3xl font-display font-bold" style={{ color: '#436E57' }}>{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: '#6B7280' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4" style={{ color: '#1E1E1F' }}>
              Not generic advice.<br /><span style={{ color: '#436E57' }}>Real intelligence.</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4B5563' }}>Every insight is grounded in data from actual job descriptions. No hallucinations. No guesswork.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-6 group cursor-default shadow-card hover:shadow-card-hover transition-shadow" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: feature.iconBg, border: `1px solid ${feature.iconBorder}`, color: feature.color }}>{feature.icon}</div>
                <h3 className="text-lg font-display font-semibold mb-2" style={{ color: '#1E1E1F' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>{feature.description}</p>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: feature.color }}>Learn more <ChevronRight className="w-3.5 h-3.5" /></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4" style={{ color: '#1E1E1F' }}>
              From resume to<span style={{ color: '#436E57' }}> action plan</span><br />in minutes.
            </h2>
          </motion.div>
          <div className="relative">
            <div className="hidden md:block absolute left-[calc(50%-0.5px)] top-8 bottom-8 w-px" style={{ background: 'linear-gradient(180deg, rgba(67,110,87,0.3), rgba(67,110,87,0.1), transparent)' }} />
            <div className="space-y-12">
              {STEPS.map((step, i) => (
                <motion.div key={step.step} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <div className={`flex-1 ${i % 2 === 1 ? 'md:text-right' : ''}`}>
                    <div className="text-xs font-mono mb-2" style={{ color: '#436E57' }}>{step.step}</div>
                    <h3 className="text-2xl font-display font-semibold mb-3" style={{ color: '#1E1E1F' }}>{step.title}</h3>
                    <p className="leading-relaxed" style={{ color: '#4B5563' }}>{step.description}</p>
                  </div>
                  <div className="relative flex-shrink-0 z-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #436E57, #5B866E)' }}>
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-bg">
        <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-12">
            <div className="text-4xl md:text-5xl font-display font-bold mb-4" style={{ color: '#1E1E1F' }}>
              Stop guessing.<br /><span style={{ color: '#436E57' }}>Start knowing.</span>
            </div>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#4B5563' }}>Get your free placement readiness analysis in minutes. No credit card required.</p>
            <Link href="/login" className="btn-primary text-base px-10 py-4 font-semibold inline-flex">
              Analyze My Profile — It&apos;s Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #436E57, #5B866E)' }}>
              <span className="text-white font-display font-bold text-xs">P</span>
            </div>
            <span className="font-display font-semibold" style={{ color: '#1E1E1F' }}>PlacementIQ</span>
          </div>
          <p className="text-sm" style={{ color: '#6B7280' }}>© 2025 PlacementIQ. Built for students who refuse to guess.</p>
        </div>
      </footer>
    </div>
  );
}
