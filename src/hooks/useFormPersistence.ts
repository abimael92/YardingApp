// hooks/useFormPersistence.ts
import { useState, useEffect } from 'react';

export function useFormPersistence<T>(
	key: string,
	initialValue: T,
): {
	value: T;
	setValue: (value: T | ((prev: T) => T)) => void;
	reset: () => void;
	clear: () => void;
} {
	const [value, setValue] = useState<T>(() => {
		if (typeof window === 'undefined') return initialValue;

		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error('Error reading from localStorage:', error);
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error('Error writing to localStorage:', error);
		}
	}, [key, value]);

	const reset = () => setValue(initialValue);
	const clear = () => {
		try {
			window.localStorage.removeItem(key);
			setValue(initialValue);
		} catch (error) {
			console.error('Error clearing localStorage:', error);
		}
	};

	return { value, setValue, reset, clear };
}
