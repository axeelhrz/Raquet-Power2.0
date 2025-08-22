import SportParametersClient from './SportParametersClient';

// Generate static params for static export
export function generateStaticParams() {
  // For static export, we need to provide all possible sport IDs at build time
  // Since sports are dynamic, we'll return an empty array for now
  // You can modify this to include actual sport IDs when you have them
  // Example: return [{ id: '1' }, { id: '2' }, { id: '3' }];
  return [];
}

export default function SportParametersPage() {
  return <SportParametersClient />;
}