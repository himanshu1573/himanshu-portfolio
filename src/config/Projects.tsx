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
    details: false,
    projectDetailsPageSlug: '/projects/crime-alert',
    isWorking: true,
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
    details: false,
    projectDetailsPageSlug: '/projects/yoom',
    isWorking: true,
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
    details: false,
    projectDetailsPageSlug: '/projects/klimate',
    isWorking: true,
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
    details: false,
    projectDetailsPageSlug: '/projects/wealth',
    isWorking: true,
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
    details: false,
    projectDetailsPageSlug: '/projects/apple-website',
    isWorking: true,
  },
];
