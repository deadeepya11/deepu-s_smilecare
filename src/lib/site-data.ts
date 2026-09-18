import {
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Cpu,
  Smile,
  Baby,
  Scissors,
  Activity,
  HeartPulse,
  Layers,
  ScanLine,
  Radiation,
  Wand2,
  Boxes,
  Zap,
  type LucideIcon,
} from "lucide-react";

import doctorAnaya from "@/assets/doctor-anaya.jpg";
import doctorRohan from "@/assets/doctor-rohan.jpg";
import doctorMeera from "@/assets/doctor-meera.jpg";
import doctorArjun from "@/assets/doctor-arjun.jpg";
import doctorSara from "@/assets/doctor-sara.jpg";
import doctorVikram from "@/assets/doctor-vikram.jpg";
import galleryClinic from "@/assets/gallery-clinic.jpg";
import galleryTeam from "@/assets/gallery-team.jpg";
import galleryTechnology from "@/assets/gallery-technology.jpg";
import galleryTreatment from "@/assets/gallery-treatment.jpg";

export const CLINIC = {
  name: "SmileCare Dental Hospital",
  tagline: "Advanced dental care with a healthier, brighter smile.",
  address: "123 Smile Street, New Delhi, India",
  phone: "+91 98765 43210",
  email: "info@smilecare.com",
  hours: [
    { day: "Monday – Friday", time: "9:00 AM – 7:00 PM" },
    { day: "Saturday", time: "9:00 AM – 5:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
};

export type Service = {
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  tint: string;
  highlights: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "general-dentistry",
    name: "General Dentistry",
    short: "Cleanings, checkups and complete oral care.",
    description:
      "Routine examinations, professional cleaning, fillings and preventive care that keep your teeth and gums healthy for life.",
    icon: Stethoscope,
    tint: "bg-sky",
    highlights: ["Dental examination & scaling", "Tooth-coloured fillings", "Preventive fluoride care"],
  },
  {
    slug: "dental-implants",
    name: "Dental Implants",
    short: "Permanent solutions for missing teeth.",
    description:
      "Titanium implants placed with guided digital planning to restore function and appearance with natural-looking crowns.",
    icon: Layers,
    tint: "bg-lavender",
    highlights: ["Single & multiple implants", "Guided digital planning", "Full-mouth rehabilitation"],
  },
  {
    slug: "orthodontics",
    name: "Orthodontics",
    short: "Braces and aligners for a perfect smile.",
    description:
      "Metal, ceramic and clear aligner treatment designed to straighten teeth and correct bite problems comfortably.",
    icon: Activity,
    tint: "bg-mint",
    highlights: ["Clear aligners", "Ceramic & metal braces", "Bite correction"],
  },
  {
    slug: "cosmetic-dentistry",
    name: "Cosmetic Dentistry",
    short: "Whitening, veneers and smile makeovers.",
    description:
      "Smile design treatments including professional whitening, porcelain veneers and aesthetic contouring.",
    icon: Sparkles,
    tint: "bg-peach",
    highlights: ["Professional whitening", "Porcelain veneers", "Digital smile design"],
  },
  {
    slug: "root-canal",
    name: "Root Canal Treatment",
    short: "Relief from pain and saving natural teeth.",
    description:
      "Painless rotary endodontic therapy that removes infection and preserves your natural tooth structure.",
    icon: HeartPulse,
    tint: "bg-sky",
    highlights: ["Single-sitting RCT", "Rotary endodontics", "Post-treatment crowns"],
  },
  {
    slug: "pediatric-dentistry",
    name: "Pediatric Dentistry",
    short: "Gentle dental care for children.",
    description:
      "Child-friendly preventive and restorative dentistry in a calm environment designed to build positive habits.",
    icon: Baby,
    tint: "bg-lavender",
    highlights: ["Sealants & fluoride", "Habit counselling", "Child-friendly visits"],
  },
  {
    slug: "oral-surgery",
    name: "Oral Surgery",
    short: "Extractions and advanced surgical care.",
    description:
      "Wisdom tooth removal, surgical extractions and minor oral surgical procedures performed under strict sterile protocol.",
    icon: Scissors,
    tint: "bg-mint",
    highlights: ["Wisdom tooth removal", "Surgical extractions", "Minor oral surgery"],
  },
];

export const TRUST_FEATURES = [
  { icon: Cpu, title: "Advanced Technology", text: "Modern dental equipment and digital diagnostics." },
  { icon: Smile, title: "Pain-Free Treatment", text: "Comfort-focused treatment experience." },
  { icon: Stethoscope, title: "Experienced Doctors", text: "Qualified dental specialists." },
  { icon: ShieldCheck, title: "Sterilized Environment", text: "Safe and hygienic clinical environment." },
];

export const TECHNOLOGIES = [
  { icon: Radiation, name: "Digital X-Ray", text: "Low-radiation imaging with instant results." },
  { icon: ScanLine, name: "Intraoral Scanner", text: "Impression-free digital scanning." },
  { icon: Wand2, name: "Digital Smile Design", text: "Preview your smile before treatment." },
  { icon: Boxes, name: "CAD/CAM", text: "Precision-milled crowns and restorations." },
  { icon: Layers, name: "3D Dental Imaging", text: "Accurate implant and surgical planning." },
  { icon: Zap, name: "Laser Dentistry", text: "Minimally invasive soft-tissue procedures." },
];

export const TESTIMONIALS = [
  {
    name: "Priya S.",
    treatment: "Teeth Whitening",
    rating: 5,
    text: "The staff were extremely friendly and the treatment experience was very comfortable.",
  },
  {
    name: "Rahul M.",
    treatment: "Root Canal Treatment",
    rating: 5,
    text: "I was nervous about my root canal, but it was completely painless and finished in one visit.",
  },
  {
    name: "Ananya K.",
    treatment: "Clear Aligners",
    rating: 5,
    text: "My aligner journey was explained clearly at every step. My smile has completely changed.",
  },
  {
    name: "Imran Q.",
    treatment: "Dental Implants",
    rating: 5,
    text: "Excellent clinical care and a spotless clinic. The implant feels just like a natural tooth.",
  },
];

export const STATS = [
  { value: "10+", label: "Experienced Doctors" },
  { value: "2K+", label: "Happy Patients" },
  { value: "15+", label: "Dental Treatments" },
  { value: "10+", label: "Years of Excellence" },
];

export type Doctor = {
  id: string;
  name: string;
  email: string;
  qualification: string;
  specialization: string;
  experience: string;
  registrationNumber: string;
  bio: string;
  availability: string;
  image: string;
};

export const DOCTORS: Doctor[] = [
  {
    id: "anaya",
    name: "Dr. Anaya Sharma",
    email: "anaya@smilecare.com",
    qualification: "BDS, MDS",
    specialization: "Senior Dental Surgeon",
    experience: "8+ Years Experience",
    registrationNumber: "DCI-2018-4471",
    bio: "Specialist in restorative and cosmetic dentistry with a gentle, patient-first approach.",
    availability: "Mon - Sat, 9:00 AM - 6:00 PM",
    image: doctorAnaya,
  },
  {
    id: "rohan",
    name: "Dr. Rohan Iyer",
    email: "rohan@smilecare.com",
    qualification: "BDS, MDS",
    specialization: "Implantologist",
    experience: "12+ Years Experience",
    registrationNumber: "DCI-2014-2210",
    bio: "Focused on advanced dental implants and full-mouth rehabilitation.",
    availability: "Mon - Fri, 10:00 AM - 7:00 PM",
    image: doctorRohan,
  },
  {
    id: "meera",
    name: "Dr. Meera Kapoor",
    email: "meera@smilecare.com",
    qualification: "BDS, MDS",
    specialization: "Orthodontist",
    experience: "9+ Years Experience",
    registrationNumber: "DCI-2017-8890",
    bio: "Braces, clear aligners and smile alignment for teens and adults.",
    availability: "Tue - Sat, 9:30 AM - 5:30 PM",
    image: doctorMeera,
  },
  {
    id: "arjun",
    name: "Dr. Arjun Nair",
    email: "arjun@smilecare.com",
    qualification: "BDS, MDS",
    specialization: "Endodontist",
    experience: "10+ Years Experience",
    registrationNumber: "DCI-2016-3345",
    bio: "Painless root canal therapy using rotary endodontics.",
    availability: "Mon - Sat, 9:00 AM - 5:00 PM",
    image: doctorArjun,
  },
  {
    id: "sara",
    name: "Dr. Sara Fernandes",
    email: "sara@smilecare.com",
    qualification: "BDS",
    specialization: "Pediatric Dentist",
    experience: "6+ Years Experience",
    registrationNumber: "DCI-2020-1123",
    bio: "Making dental visits calm and friendly for children.",
    availability: "Mon - Fri, 9:00 AM - 4:00 PM",
    image: doctorSara,
  },
  {
    id: "vikram",
    name: "Dr. Vikram Desai",
    email: "vikram@smilecare.com",
    qualification: "BDS, MDS",
    specialization: "Oral & Maxillofacial Surgeon",
    experience: "14+ Years Experience",
    registrationNumber: "DCI-2012-5567",
    bio: "Wisdom tooth removal and complex oral surgical procedures.",
    availability: "Mon - Sat, 11:00 AM - 7:00 PM",
    image: doctorVikram,
  },
];

export const DOCTOR_IMAGES: Record<string, string> = {
  "anaya@smilecare.com": doctorAnaya,
  "rohan@smilecare.com": doctorRohan,
  "meera@smilecare.com": doctorMeera,
  "arjun@smilecare.com": doctorArjun,
  "sara@smilecare.com": doctorSara,
  "vikram@smilecare.com": doctorVikram,
};

export const GALLERY = [
  { src: galleryClinic, alt: "SmileCare clinic reception area", category: "Clinic" },
  { src: galleryTeam, alt: "The SmileCare dental team", category: "Doctors" },
  { src: galleryTreatment, alt: "Dentist performing a gentle dental treatment", category: "Treatment" },
  { src: galleryTechnology, alt: "Intraoral scanner and digital dental imaging", category: "Technology" },
  { src: galleryClinic, alt: "Bright, calm patient waiting facilities", category: "Facilities" },
  { src: galleryTreatment, alt: "Patient receiving a routine dental checkup", category: "Treatment" },
  { src: galleryTechnology, alt: "Digital dental diagnostics workstation", category: "Technology" },
  { src: galleryTeam, alt: "Dental specialists reviewing a treatment plan", category: "Doctors" },
];

export const GALLERY_CATEGORIES = ["All", "Clinic", "Doctors", "Treatment", "Technology", "Facilities"];

export const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

export const APPOINTMENT_TYPES = ["New Consultation", "Follow-up", "Emergency"];
