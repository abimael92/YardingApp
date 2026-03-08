// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Returns whether the given media query matches.
 * Safe for SSR: initial render is false; updates after mount to avoid hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const media = window.matchMedia(query);
		setMatches(media.matches);

		const listener = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};
		media.addEventListener('change', listener);
		return () => media.removeEventListener('change', listener);
	}, [query]);

	return matches;
}
