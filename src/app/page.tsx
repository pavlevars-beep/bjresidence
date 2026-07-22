import { Hero } from "@/components/sections/Hero";
import { WhyUs } from "@/components/sections/WhyUs";
import { Gallery } from "@/components/sections/Gallery";
import { PersonalUnit } from "@/components/sections/PersonalUnit";
import { Included } from "@/components/sections/Included";
import { Location } from "@/components/sections/Location";
import { BookingForm } from "@/components/sections/BookingForm";
import { Companies } from "@/components/sections/Companies";
import { HouseRules } from "@/components/sections/HouseRules";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyUs />
      <Gallery />
      <PersonalUnit />
      <Included />
      <Location />
      <BookingForm />
      <Companies />
      <HouseRules />
      <Faq />
      <FinalCta />
    </>
  );
}
