export function combineClasses(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
} 