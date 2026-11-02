export function waitUntil<T>(getValue: () => T | null | undefined, intervalMs = 100, timeoutMs = 5000): Promise<T> {
	return new Promise((resolve, reject) => {
		const start = Date.now();

		const check = () => {
			const val = getValue();
			if (val !== null && val !== undefined) {
				resolve(val);
				return;
			}

			if (Date.now() - start > timeoutMs) {
				reject(new Error("waitUntil: exceeded timeout"));
				return;
			}

			setTimeout(check, intervalMs);
		};

		check();
	});
}