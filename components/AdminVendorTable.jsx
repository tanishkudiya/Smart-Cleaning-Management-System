'use client'

import { Button } from '@/components/ui/button'

export default function AdminVendorTable({ vendors, onToggleStatus }) {
  return (
    <table className="w-full border border-gray-300 rounded">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Company</th>
          <th className="p-2 text-left">Status</th>
          <th className="p-2 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map(vendor => (
          <tr key={vendor.id} className="border-t">
            <td className="p-2">{vendor.name}</td>
            <td className="p-2">{vendor.company || '-'}</td>
            <td className="p-2 capitalize">{vendor.status}</td>
            <td className="p-2">
              <Button
                variant={vendor.status === 'active' ? 'destructive' : 'default'}
                onClick={() => onToggleStatus(vendor.id, vendor.status)}
              >
                {vendor.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
