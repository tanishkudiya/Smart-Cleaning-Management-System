'use client'

export default function VendorTable({ vendors, onEdit, onDelete }) {
  return (
    <table className="w-full border rounded overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left">Company</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map((vendor) => (
          <tr key={vendor.id} className="border-t">
            <td className="px-4 py-2">{vendor.name}</td>
            <td className="px-4 py-2">{vendor.company}</td>
            <td className="px-4 py-2">{vendor.status}</td>
            <td className="px-4 py-2 space-x-2 text-center">
              <button
                onClick={() => onEdit(vendor)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(vendor.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
