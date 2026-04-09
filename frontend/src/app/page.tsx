"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Users, Stethoscope, Building2, ChevronRight, ShieldCheck, Clock } from 'lucide-react';

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg font-sans selection:bg-dash-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 p-2.5 rounded-xl">
                 <Activity className="text-dash-primary" size={28} />
              </div>
              <span className="text-2xl font-black text-dash-navy tracking-tight">MedCare Plus</span>
            </div>
            <div className="hidden md:flex space-x-10 text-sm font-bold text-gray-500">
              <a href="#about" className="hover:text-dash-primary transition-colors">About Us</a>
              <a href="#impact" className="hover:text-dash-primary transition-colors">Our Impact</a>
              <a href="#services" className="hover:text-dash-primary transition-colors">Services</a>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="bg-dash-primary hover:bg-dash-secondary text-white px-7 py-3 rounded-full font-bold shadow-lg shadow-sky-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                Staff Portal <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden flex items-center justify-center min-h-[90vh]">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-sky-400/20 to-indigo-400/20 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/30 to-emerald-200/20 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />
        
        <div className="max-w-7xl mx-auto text-center z-10 w-full relative">
          <motion.div initial="initial" animate="animate" variants={staggerContainer}>
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-blue-700 text-sm font-bold mb-8 shadow-sm">
               <ShieldCheck size={18} /> HIPAA Compliant Architecture
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold text-dash-navy tracking-tight mb-8 leading-tight">
              Next-Generation Healthcare <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Management Ecosystem</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Empowering medical professionals with seamless EHR integrations, intelligent appointment scheduling, and automated Medicare/Medicaid claims processing.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link 
                href="/login" 
                className="bg-dash-navy hover:bg-slate-800 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 hover:shadow-2xl flex justify-center items-center gap-2"
              >
                Access Platform
              </Link>
              <a 
                href="#about" 
                className="bg-white hover:bg-gray-50 text-dash-navy border border-gray-200 px-10 py-4 rounded-full font-bold text-lg shadow-sm transition-all hover:-translate-y-1 flex justify-center items-center"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="py-24 bg-white border-y border-gray-100 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-dash-navy mb-4">Platform Scale</h2>
             <p className="text-gray-500 font-medium">Delivering robust infrastructure across regional care centers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="p-10 rounded-[2rem] bg-sky-50/50 border border-sky-100 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300"
            >
              <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-sky-500 relative overflow-hidden group">
                <Users size={36} className="relative z-10 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-5xl font-black text-dash-navy mb-3">12,450+</h3>
              <p className="text-lg font-bold text-gray-500">Registered Patients</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-10 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300"
            >
              <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-indigo-500 group">
                <Stethoscope size={36} className="relative z-10 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-5xl font-black text-dash-navy mb-3">340+</h3>
              <p className="text-lg font-bold text-gray-500">Specialist Doctors</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-10 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300"
            >
              <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-emerald-500 group">
                <Building2 size={36} className="relative z-10 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-5xl font-black text-dash-navy mb-3">850+</h3>
              <p className="text-lg font-bold text-gray-500">Medical Staffs</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-dash-bg relative overflow-hidden">
        <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-gradient-to-l from-sky-200/30 to-transparent blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 text-sm font-bold mb-8">
                <Clock size={16} className="text-dash-primary" /> Established 2026
              </div>
              <h2 className="text-4xl md:text-[3rem] font-extrabold text-dash-navy tracking-tight mb-8 leading-tight">
                Transforming the standard of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">patient care</span>.
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed font-medium">
                At MedCare Plus, we believe that healthcare providers should focus completely on patient wellness, not administrative burdens. Our centralized platform unifies Electronic Health Records, complex Medicare claims, and dynamic scheduling.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                We are a secure, modern network designed to optimize hospital flows, ensuring data is HIPAA compliant, encrypted, and instantly accessible to authorized doctors, nurses, and billing officers.
              </p>

              <div className="mt-12 flex gap-5 bg-white p-4 pr-8 rounded-full shadow-sm border border-gray-100 inline-flex items-center">
                <div className="flex -space-x-3">
                   <div className="w-12 h-12 rounded-full border-[3px] border-white bg-sky-200 flex items-center justify-center font-bold text-sky-700 text-sm z-30">GH</div>
                   <div className="w-12 h-12 rounded-full border-[3px] border-white bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm z-20">MH</div>
                   <div className="w-12 h-12 rounded-full border-[3px] border-white bg-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-sm z-10">SH</div>
                </div>
                <div className="flex flex-col justify-center">
                   <span className="font-extrabold text-dash-navy">Trusted by</span>
                   <span className="text-sm font-semibold text-gray-500">Top Regional Hospitals</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[3rem] bg-gradient-to-tr from-sky-400 to-indigo-500 p-1 shadow-2xl relative">
                 <div className="absolute inset-1 bg-white rounded-[2.8rem] overflow-hidden flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-32 h-32 bg-sky-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                       <Activity className="text-sky-400" size={64} />
                    </div>
                    <h3 className="text-3xl font-black text-dash-navy mb-4">State-of-the-art Infrastructure</h3>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">
                       Our cloud-native platform guarantees 99.99% uptime, keeping critical medical data available exactly when lives depend on it.
                    </p>
                 </div>
              </div>
              
              {/* Floating element */}
              <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100"
              >
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-green-50 shadow-inner text-green-500 rounded-2xl">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Data Security</p>
                       <p className="text-2xl font-black text-dash-navy">AES-256</p>
                    </div>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dash-navy text-white/70 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
           <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
             <Activity className="text-sky-400" size={28} />
             <span className="text-2xl font-black text-white tracking-tight">MedCare Plus</span>
           </div>
           <p className="text-sm font-medium text-slate-400">© 2026 Medicare/Medicaid Hospital Management Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
