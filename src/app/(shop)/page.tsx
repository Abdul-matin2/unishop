import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Recommendations } from "@/components/home/Recommendations";
import { Newsletter } from "@/components/home/Newsletter";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      {!user && <Hero />}
      <CategoryShowcase />
      <FeaturedProducts />
      <Recommendations />
      <Newsletter />
    </>
  );
}