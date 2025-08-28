export default function MenuCard({ item, onAdd, disabled }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="text-4xl mb-3 text-center">{item.image}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-orange-600">${item.price}</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            item.stock > 10 ? 'bg-green-100 text-green-800' : 
            item.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {item.stock > 10 ? 'In Stock' : 
             item.stock > 0 ? `${item.stock} left` : 'Out of Stock'}
          </span>
        </div>
        
        <button
          onClick={onAdd}
          disabled={disabled}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700'
          }`}
        >
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
