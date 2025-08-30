import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BadgeDesigner from "~/components/BadgeDesigner";
import { ImageTest } from "~/components/ImageTest";

export const meta: MetaFunction = () => {
  return [
    { title: "Badge Designer" },
    { name: "description", content: "Design your custom badges" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product");
  const shop = url.searchParams.get("shop");
  
  // Add headers for iframe embedding
  const headers = new Headers();
  headers.set("X-Frame-Options", "ALLOWALL");
  headers.set("Content-Security-Policy", "frame-ancestors *");
  headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  
  return json({ 
    productId, 
    shop, 
    timestamp: Date.now(),
    GADGET_API_URL: process.env.GADGET_API_URL || 'https://allqualitybadges-development.gadget.app',
    GADGET_API_KEY: process.env.GADGET_API_KEY,
  }, { headers });
};

export default function Index() {
  const { productId, shop, GADGET_API_URL, GADGET_API_KEY } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main BadgeDesigner with integrated image functionality */}
      <BadgeDesigner 
        productId={productId} 
        shop={shop} 
        gadgetApiUrl={GADGET_API_URL}
        gadgetApiKey={GADGET_API_KEY}
      />
    </div>
  );
}
