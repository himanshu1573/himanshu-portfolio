import { Quote } from '@/components/common/Quote';
import SectionDivider from '@/components/common/SectionDivider';
import AboutMe from '@/components/landing/AboutMe';
// import Achievements from '@/components/landing/Achievements';
import Blog from '@/components/landing/Blog';
import Experience from '@/components/landing/Experience';
import Hero from '@/components/landing/Hero';
import Newsletter from '@/components/landing/Newsletter';
import OpenSourceContributions from '@/components/landing/OpenSourceContributions';
import Work from '@/components/landing/Projects';
import Reading from '@/components/landing/Reading';
import Skills from '@/components/landing/Skills';
// import Testimonials from '@/components/landing/Testimonials';
import React from 'react';

/** Keep homepage blog preview in sync with Medium publishes */
export const revalidate = 3600;

export default function page() {
  return (
    <main>
      <div className="content-column content-column-dashed relative mx-auto">
        <Hero />

        {/* Titled sections own their top/bottom rules — no extra dividers between them */}
        <Experience />
        <Work />
        <OpenSourceContributions />
        <Skills />
        {/* <Achievements /> */}
        <Blog />
        <Reading />
        {/* <Testimonials /> — enable once src/config/Testimonials.tsx has real entries */}
        <AboutMe />
        <Newsletter />

        <SectionDivider />
        <Quote />
      </div>
    </main>
  );
}
