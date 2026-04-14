import AdminLayout from '@/components/AdminLayout';
import EditUnitForm from '@/components/EditUnitForm';

export default async function EditUnitPage({ params }: any) {
  // Safe resolution in Next.js 15+ where params could be a promise
  const resolvedParams = await Promise.resolve(params);
  const unitId = resolvedParams?.id ? Number(resolvedParams.id) : 0;

  return (
    <AdminLayout title="Edit Unit">
      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <EditUnitForm unitId={unitId} />
        </div>
      </div>
    </AdminLayout>
  );
}