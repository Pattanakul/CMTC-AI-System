import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  BookOpen,
  Search,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Database,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Search',
    description: 'ค้นหาความรู้ด้วย AI ที่เข้าใจบริบทและความหมายเชิงลึก',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    description: 'จัดเก็บและจัดการความรู้องค์กรอย่างเป็นระบบ',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'ทำงานร่วมกันได้อย่างราบรื่นในทีม',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Auto Categorization',
    description: 'จัดหมวดหมู่เนื้อหาอัตโนมัติด้วย AI',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'ควบคุมสิทธิ์การเข้าถึงข้อมูลตามบทบาท',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Database,
    title: 'Secure Storage',
    description: 'จัดเก็บข้อมูลอย่างปลอดภัยด้วย Supabase PostgreSQL',
    gradient: 'from-slate-500 to-slate-600',
  },
]

const stats = [
  { label: 'บทความความรู้', value: '1,200+', icon: BookOpen },
  { label: 'ผู้ใช้งาน', value: '350+', icon: Users },
  { label: 'การค้นหา/วัน', value: '5,000+', icon: Search },
  { label: 'ความแม่นยำ AI', value: '98%', icon: TrendingUp },
]

const techStack = [
  'Next.js 15',
  'React 19',
  'TypeScript',
  'Tailwind CSS',
  'shadcn/ui',
  'Supabase',
  'PostgreSQL',
  'n8n',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/40 via-transparent to-violet-950/40 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/20 sticky top-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">CMTC AI KMS</span>
              <div className="text-[10px] text-blue-400/70 leading-none">Knowledge Management System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs px-3 py-1 hidden sm:flex">
              <Sparkles className="w-3 h-3 mr-1" />
              Milestone 1
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent"
            >
              เข้าสู่ระบบ
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-blue-500/20"
            >
              เริ่มใช้งาน
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-28 pb-20 text-center">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-300 border-blue-500/20 px-4 py-1.5 text-sm inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            ระบบพร้อมใช้งาน — Version 1.0
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            ระบบจัดการความรู้
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              ขับเคลื่อนด้วย AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            CMTC AI Knowledge Management System — แพลตฟอร์มจัดการความรู้องค์กรที่ชาญฉลาด
            ช่วยให้ทีมค้นหา แชร์ และใช้ประโยชน์จากความรู้ได้อย่างมีประสิทธิภาพสูงสุด
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white gap-2 px-8 shadow-xl shadow-blue-500/25 border-0"
            >
              เริ่มต้นใช้งานฟรี
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent gap-2 px-8"
            >
              <BookOpen className="w-4 h-4" />
              ดูเอกสาร
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center hover:bg-white/[0.05] transition-all duration-300 hover:border-white/10"
            >
              <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
            ฟีเจอร์หลัก
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ทุกสิ่งที่คุณต้องการ
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            ครบครันด้วยเครื่องมือที่ทันสมัยสำหรับการจัดการความรู้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05] group cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div
                  className={`w-11 h-11 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative container mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">เทคโนโลยีที่ใช้</h2>
          <p className="text-slate-500 text-sm">สร้างด้วย stack ที่ทันสมัยและน่าเชื่อถือ</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="px-4 py-2 text-sm border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-blue-400 transition-all duration-200 cursor-default bg-white/[0.02] hover:bg-blue-500/5"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-6 py-20">
        <div className="relative bg-gradient-to-r from-blue-600/10 to-violet-600/10 border border-white/5 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-violet-600/5 blur-xl" />
          <div className="relative">
            <Sparkles className="w-10 h-10 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              พร้อมเริ่มต้นหรือยัง?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              เข้าร่วมกับทีมที่ใช้ CMTC AI KMS เพื่อจัดการความรู้องค์กรอย่างมีประสิทธิภาพ
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white gap-2 px-10 shadow-xl shadow-blue-500/25 border-0"
            >
              เริ่มใช้งานฟรีวันนี้
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-400 text-sm">CMTC AI Knowledge Management System</span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 CMTC. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
