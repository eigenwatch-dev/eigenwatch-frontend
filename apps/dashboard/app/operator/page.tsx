import { getOperators } from "@/actions/operators";
import { OperatorList } from "./_components/OperatorList";

export default async function OperatorPage() {
  // Fetch initial operator list server-side for SSR
  const initialRes = await getOperators({ limit: 20, offset: 0 });
  const initialData = initialRes.data?.data || [];
  const initialPagination = initialRes.data?.pagination;

  return (
    <OperatorList
      initialData={initialData}
      initialPagination={initialPagination}
    />
  );
}
