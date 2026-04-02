const DEFAULT_BASE = 'https://presales-app-be.onrender.com';
function getBaseUrl() {
    const fromEnv = import.meta.env.VITE_API_URL;
    return (typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : DEFAULT_BASE).replace(/\/$/, '');
}
export async function analyzePresales(payload) {
    const url = `${getBaseUrl()}/api/presales/analyze`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
    return res.json();
}
