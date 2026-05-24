// src/components/ui/Field.jsx
import FormLabel from './FormLabel'

export default function Field({ label, children }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      {children}
    </div>
  )
}
