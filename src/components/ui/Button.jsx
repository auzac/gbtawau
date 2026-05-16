function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary:
      'bg-[#2D2926] text-white hover:bg-[#453D38]',

    secondary:
      'border border-[#E5DDD3] text-[#5F5752] hover:bg-[#F6F1EB]',

    ghost:
      'text-[#7A6A5E] hover:text-[#2D2926]'
  }

  return (
    <button
      className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button