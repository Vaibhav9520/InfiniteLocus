export default function MenuCard({ item, onAdd, disabled }) {
  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, padding: 12, textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0' }}>{item.name}</h3>
          <div style={{ fontSize: 12, color: '#aaa' }}>Stock: {item.stock ?? 0}</div>
        </div>
        <div style={{ fontWeight: 600 }}>₹{item.price?.toFixed?.(2) ?? '0.00'}</div>
      </div>
      <button disabled={disabled} onClick={() => onAdd(item)} style={{ marginTop: 10 }}>
        {disabled ? 'Out of stock' : 'Add to cart'}
      </button>
    </div>
  )
}

