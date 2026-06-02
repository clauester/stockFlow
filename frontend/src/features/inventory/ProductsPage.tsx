import ProductTable from './ProductTable'

export default function ProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Productos</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión del inventario de productos</p>
      </div>
      <ProductTable />
    </div>
  )
}
