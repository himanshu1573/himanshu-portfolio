import Container from '@/components/common/Container';
import SectionDivider from '@/components/common/SectionDivider';
// import Blog from '@/components/landing/Blog';
import CTA from '@/components/landing/CTA';
import Experience from '@/components/landing/Experience';
import Github from '@/components/landing/Github';
import Hero from '@/components/landing/Hero';
import OpenSourceContributions from '@/components/landing/OpenSourceContributions';
// import Journey from '@/components/landing/Journey';
import Work from '@/components/landing/Projects';
// import Setup from '@/components/landing/Setup';
import React from 'react';

export default function page() {
  return (
    <Container className="min-h-screen py-16">
      <Hero />

      <SectionDivider />

      <Experience />

      <SectionDivider />

      <Work />

      <SectionDivider />

      <Github />

      <SectionDivider />

      <OpenSourceContributions />

      <SectionDivider />

      {/* Blog */}
      {/* <Blog /> */}

      {/* <SectionDivider /> */}
      <CTA />
      {/* <Setup /> */}
      {/* <Journey /> */}
    </Container>
  );
}
