import { LandingPage } from "@/components/landing-page";
import Image from "next/image";
import profile from "./head-pic.jpeg";

export default function Home() {
  return (
    <LandingPage
      image={
        <Image
          src={profile}
          alt="Jude Gao"
          width={128}
          height={128}
          className="rounded-full border-2 border-zinc-700"
          loading="eager"
        />
      }
    />
  );
}
