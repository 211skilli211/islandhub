import VideoGenerator from '@/components/VideoGenerator';

interface ShareButtonsClientProps {
  listing: {
    id: string;
    title: string;
    images: string[];
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
          listingId={listing.id}
          listingTitle={listing.title}
          listingImages={listing.images || []}
          listingDescription={listing.description}
          vendorName={listing.vendor?.name || listing.store?.name}
          primaryColor={listing.primaryColor || '#0ea5e9'}
        />
      </div>
    </div>
  );
}
