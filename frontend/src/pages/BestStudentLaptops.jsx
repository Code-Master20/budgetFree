import LaptopCollectionPage from "./LaptopCollectionPage";

export default function BestStudentLaptops() {
  return (
    <LaptopCollectionPage
      eyebrow="Best laptops for students"
      title="Best laptops for students"
      subtitle="Browse student-friendly laptop picks for classes, assignments, browsing, and everyday study work."
      requestParams={{ search: "laptop students", limit: 300 }}
      callout="This collection is tuned for study use, so the search starts with student-focused laptop terms instead of showing every accessory and side category first."
      emptyStateTitle="No student laptops found yet"
      emptyStateCopy="Add or seed laptop products tagged for students to populate this collection."
    />
  );
}
