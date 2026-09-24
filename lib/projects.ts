export type Project = {
  /** Stable id, also used as React key and DOM id prefix */
  id: string;
  title: string;
  period: string;
  description: string;
  href: string;
  /** Path under /public */
  thumbnail: string;
  thumbnailAlt: string;
};

const CASE_STUDY_BASE = "https://adarsh89p.github.io/rakhi-das-portfolio/case-studies";

export const projects: Project[] = [
  {
    id: "suraksha",
    title: "Suraksha — Diagnostic Ecosystem",
    period: "Mar 2025 – Jul 2025",
    description:
      "Five connected products, four user types, one system. Simplified patient, doctor and admin workflows across app, website and dashboard.",
    href: `${CASE_STUDY_BASE}/suraksha_case_study.html`,
    thumbnail: "/images/projects/suraksha.png",
    thumbnailAlt: "Suraksha admin dashboard showing diagnostic bookings and analytics",
  },
  {
    id: "yoga",
    title: "Yoga All-in-One",
    period: "Jan 2024 – Nov 2024",
    description:
      "Replaced five scattered wellness apps — timetable, video library, meditation, recipes and shop — with one. Four-screen onboarding into guided sessions, routines and progress tracking.",
    href: `${CASE_STUDY_BASE}/yoga_case_study.html`,
    thumbnail: "/images/projects/yoga.jpg",
    thumbnailAlt: "Yoga All-in-One app screens with guided sessions and routines",
  },
  {
    id: "influencer",
    title: "Influencer Marketing Platform",
    period: "Jan 2023 – Sept 2023",
    description:
      "One platform for influencer–brand collaboration covering the full four-stage journey: discovery, communication, payments and campaign tracking.",
    href: "https://www.figma.com/deck/7Z5C9KMnP7e2YqW3y3xLEM/Cheeky?node-id=2-1411&t=EG6GvTgBjcCRHNGp-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1",
    thumbnail: "/images/projects/influencer.png",
    thumbnailAlt: "Influencer marketing platform screens for campaign discovery and tracking",
  },
  {
    id: "malta-taxi",
    title: "Malta Taxi App",
    period: "Jan 2024 – Jul 2024",
    description:
      "A taxi booking app for Malta, where most riders are tourists: clear pricing before the ride is confirmed, a live map of nearby taxis, and a booking flow short enough to finish at the kerb.",
    href: `${CASE_STUDY_BASE}/malta_taxi_case_study.html`,
    thumbnail: "/images/projects/malta-taxi.png",
    thumbnailAlt: "Malta Taxi app screens with a live map and fare estimate",
  },
  {
    id: "banking",
    title: "Mobile Banking Onboarding",
    period: "Nov 2025",
    description:
      "A three-screen onboarding into QIIB’s mobile banking app, opening onto four destinations — accounts, partner services, ATM locator and a live currency converter.",
    href: `${CASE_STUDY_BASE}/banking_case_study.html`,
    thumbnail: "/images/projects/banking.png",
    thumbnailAlt: "Mobile banking onboarding screens",
  },
];

export const moreProjectsHref = "https://www.behance.net/rakhidas1";
