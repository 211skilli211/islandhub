import VideoGenerator from '@/components/VideoGenerator';

interface ShareButtonsClientProps {
  listing: {
    id: number;
    title: string;
    images?: string[];
    photos?: { id: string; url: string; is_primary: boolean; order_index: number }[];
    description?: string;
    vendor?: { name: string };
    store?: { name: string };
    primaryColor?: string;
  };
}

export default function ShareButtonsClient({ listing }: ShareButtonsClientProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Share buttons would be here */}
        <div className="flex gap-2">
          {/* Existing share buttons */}
        </div>

        {/* Video Generator Button */}
        <VideoGenerator
          listingId={String(listing.id)}
          listingTitle={listing.title}
          listingImages={listing.images || listing.photos?.filter(p => p.url).map(p => p.url).slice(0, 5) || []}
          listingDescription={listing.description}
          vendorName={listing.vendor?.name || listing.store?.name}
          primaryColor={listing.primaryColor || '#0ea5e9'}
        />
      </div>
    </div>
  );
}
