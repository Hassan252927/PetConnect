import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../store';

/**
 * Custom hook that uses shallowEqual for comparison to prevent unnecessary re-renders
 * when the selected state hasn't actually changed.
 */
export function useShallowEqualSelector<TSelected>(
  selector: (state: RootState) => TSelected
): TSelected {
  return useSelector(selector, shallowEqual);
} 