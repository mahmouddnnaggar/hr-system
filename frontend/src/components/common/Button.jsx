import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
  ghost:
    'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  success:
    'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700',
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-sm',
  icon: 'h-10 w-10 p-0',
};

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  as: Component = 'button',
  type = 'button',
  ...props
}) {
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 text-white',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
