// ========================================
// TWIN CAPITAL — Animation Utilities
// ========================================

export function getStaggerClass(index) {
  return `stagger-${Math.min(index + 1, 6)}`;
}

export function getAnimatedStyle(index, baseDelay = 0) {
  return {
    opacity: 0,
    animation: `fadeInUp 0.5s ease ${baseDelay + index * 0.08}s forwards`,
  };
}
