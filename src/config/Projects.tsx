import Clerk from '@/components/technologies/Clerk';
import GSAP from '@/components/technologies/GSAP';
import Mapbox from '@/components/technologies/Mapbox';
import MongoDB from '@/components/technologies/MongoDB';
import NextAuth from '@/components/technologies/NextAuth';
import NextJs from '@/components/technologies/NextJs';
import Prisma from '@/components/technologies/Prisma';
import Python from '@/components/technologies/Python';
import ReactIcon from '@/components/technologies/ReactIcon';
import Shadcn from '@/components/technologies/Shadcn';
import TailwindCss from '@/components/technologies/TailwindCss';
import ThreeJs from '@/components/technologies/ThreeJs';
import TypeScript from '@/components/technologies/TypeScript';
import WebRTC from '@/components/technologies/WebRTC';
import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    title: 'Crime Alert',
    description:
      'A full-stack application built with Next.js 14 for anonymous crime reporting with AI-powered features and location mapping',
    image: '/project/crimereport_ai.png',
    link: 'https://crime-alert-app.vercel.app/',
    technologies: [
      { name: 'Next.js', icon: <NextJs key="nextjs" /> },
      { name: 'React', icon: <ReactIcon key="react" /> },
      { name: 'TypeScript', icon: <TypeScript key="typescript" /> },
      { name: 'Prisma', icon: <Prisma key="prisma" /> },
      { name: 'Tailwind CSS', icon: <TailwindCss key="tailwindcss" /> },
      { name: 'NextAuth', icon: <NextAuth key="nextauth" /> },
      { name: 'Mapbox', icon: <Mapbox key="mapbox" /> },
    ],
    github: 'https://github.com/Saurabhsing21/crime-report-ai',
    live: 'https://crime-alert-app.vercel.app/',
    details: true,
    projectDetailsPageSlug: '/projects/crime-alert',
    isWorking: true,
    detailContent: {
      overview:
        'Built Crime Alert so people can report incidents without exposing their identity. The goal was a secure reporting flow that still feels fast, map-aware, and useful for follow-up — not just a form that dumps text into a database.',
      highlightsLabel: 'Crime Alert gives reporters:',
      highlights: [
        'Fully anonymous incident reporting with protected identity by default',
        'AI-assisted report drafting and categorization powered by Google Gemini',
        'Interactive Mapbox location pinning so reports are tied to real places',
        'Authenticated admin-side workflows with NextAuth and encrypted credentials',
        'Prisma + Neon backed storage for reliable report persistence and queries',
      ],
      outcome:
        'The result is a production-ready reporting platform where anonymity, location context, and AI assistance work together instead of fighting each other.',
    },
  },
  {
    title: 'Yoom',
    description:
      'A modern Zoom clone crafted with Next.js and TypeScript, delivering a robust video conferencing experience',
    image: '/project/yoom.png',
    link: 'https://yoom.vercel.app/',
    technologies: [
      { name: 'Next.js', icon: <NextJs key="nextjs" /> },
      { name: 'TypeScript', icon: <TypeScript key="typescript" /> },
      { name: 'React', icon: <ReactIcon key="react" /> },
      { name: 'WebRTC', icon: <WebRTC key="webrtc" /> },
      { name: 'Clerk', icon: <Clerk key="clerk" /> },
      { name: 'Tailwind CSS', icon: <TailwindCss key="tailwindcss" /> },
      { name: 'shadcn/ui', icon: <Shadcn key="shadcn" /> },
    ],
    github: 'https://github.com/Saurabhsing21/yoom',
    live: 'https://yoom.vercel.app/',
    details: true,
    projectDetailsPageSlug: '/projects/yoom',
    isWorking: true,
    detailContent: {
      overview:
        'Yoom is a Zoom-style video conferencing app I built to learn real-time collaboration end to end — auth, meeting rooms, media controls, and scheduling — without sacrificing a clean product feel.',
      highlightsLabel: 'Yoom lets users:',
      highlights: [
        'Sign in securely with Clerk (social + email/password)',
        'Start instant meetings or schedule upcoming ones with shareable links',
        'Control the call with mute, video toggle, screen share, reactions, and layout options',
        'Manage participants (pin, mute, remove) and end or leave meetings cleanly',
        'Revisit past meetings and recordings from a dedicated history view',
        'Use a personal room with a permanent meeting link for quick 1:1s',
      ],
      outcome:
        'It ships as a responsive, real-time meeting product — the kind of system where auth, state, and media controls all have to stay in sync.',
    },
  },
  {
    title: 'Klimate',
    description:
      'A comprehensive weather application that automatically detects your location and provides real-time weather data with 24-hour forecasts',
    image: '/project/klimate.png',
    link: 'https://github.com/Saurabhsing21/Klimate',
    technologies: [
      { name: 'React', icon: <ReactIcon key="react" /> },
      { name: 'TypeScript', icon: <TypeScript key="typescript" /> },
    ],
    github: 'https://github.com/Saurabhsing21/Klimate',
    live: 'https://github.com/Saurabhsing21/Klimate',
    details: true,
    projectDetailsPageSlug: '/projects/klimate',
    isWorking: true,
    detailContent: {
      overview:
        'Klimate is a weather app focused on clarity: detect where you are, show what’s happening now, and make the next 24 hours easy to scan — without burying people under charts they don’t need.',
      highlightsLabel: 'Klimate focuses on:',
      highlights: [
        'Automatic location detection so weather loads with almost no setup',
        'Real-time current conditions with a clean, readable dashboard',
        '24-hour forecast views for planning the rest of the day',
        'City search when you want weather for somewhere else',
        'A responsive UI that stays usable on phone and desktop',
      ],
      outcome:
        'A lightweight weather experience that prioritizes speed and readability over noisy widgets.',
    },
  },
  {
    title: 'Wealth',
    description:
      'A comprehensive financial management solution that harnesses AI to simplify tracking income and expenses across multiple accounts',
    image: '/project/wealth.png',
    link: 'https://welth-roan.vercel.app/',
    technologies: [
      { name: 'Next.js', icon: <NextJs key="nextjs" /> },
      { name: 'React', icon: <ReactIcon key="react" /> },
      { name: 'TypeScript', icon: <TypeScript key="typescript" /> },
      { name: 'Python', icon: <Python key="python" /> },
      { name: 'MongoDB', icon: <MongoDB key="mongodb" /> },
      { name: 'Tailwind CSS', icon: <TailwindCss key="tailwindcss" /> },
    ],
    github: 'https://github.com/Saurabhsing21/Wealth-',
    live: 'https://welth-roan.vercel.app/',
    details: true,
    projectDetailsPageSlug: '/projects/wealth',
    isWorking: true,
    detailContent: {
      overview:
        'Wealth is an AI-assisted finance platform I built to make multi-account money tracking less tedious. Instead of only logging numbers, it helps categorize activity and surface what’s actually happening in your finances.',
      highlightsLabel: 'Wealth helps you:',
      highlights: [
        'Track income and expenses across multiple accounts in one place',
        'Use AI (Gemini) to assist with categorization and financial insights',
        'Secure access with Clerk-based authentication and onboarding',
        'Stay protected with rate limiting / bot protection via ArcJet',
        'Run background jobs and email workflows for recurring finance ops',
        'Manage data through a modern Next.js + Prisma backed architecture',
      ],
      outcome:
        'A practical personal-finance product where AI reduces busywork and the dashboard stays trustworthy enough for real money decisions.',
    },
  },
  {
    title: 'Apple Website',
    description:
      "A visually stunning recreation of Apple's iPhone 15 Pro landing page with seamless animations and interactive 3D models",
    image: '/project/apple_website.jpg',
    link: 'https://iphone-ivory-zeta.vercel.app/',
    technologies: [
      { name: 'React.js', icon: <ReactIcon key="react" /> },
      { name: 'Three.js', icon: <ThreeJs key="threejs" /> },
      { name: 'GSAP', icon: <GSAP key="gsap" /> },
      { name: 'Tailwind CSS', icon: <TailwindCss key="tailwindcss" /> },
    ],
    github: 'https://github.com/Saurabhsing21/Iphonee',
    live: 'https://iphone-ivory-zeta.vercel.app/',
    details: true,
    projectDetailsPageSlug: '/projects/apple-website',
    isWorking: true,
    detailContent: {
      overview:
        'This is a high-fidelity recreation of Apple’s iPhone 15 Pro marketing site — built to practice cinematic web motion, 3D product presentation, and the kind of polish that makes a landing page feel expensive.',
      highlightsLabel: 'The experience includes:',
      highlights: [
        'Smooth GSAP-powered scroll and section animations',
        'Interactive Three.js iPhone models with color and size variations',
        'A custom video carousel crafted with GSAP timelines',
        'Pixel-conscious layout and typography inspired by Apple’s marketing site',
        'Fully responsive behavior across desktop and mobile viewports',
      ],
      outcome:
        'A front-end showcase focused on animation craft, 3D interaction, and product storytelling on the web.',
    },
  },
];
