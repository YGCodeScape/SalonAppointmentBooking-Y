// ===============================
// API HELPER
// ===============================

async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("access_token");

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    };

    // attach token automatically
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            config
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "API Error");
        }

        return data;

    } catch (error) {

        console.error("API request failed:", error);

        throw error;

    }
}

// ===============================
// GET
// ===============================

async function apiGet(endpoint) {
    return apiRequest(endpoint, {
        method: "GET"
    });
}

// ===============================
// POST
// ===============================

async function apiPost(endpoint, body) {
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

// ===============================
// PATCH
// ===============================

async function apiPatch(endpoint, body) {
    return apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}

// ===============================
// PUT
// ===============================

async function apiPut(endpoint, body) {
    return apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}

// ===============================
// DELETE
// ===============================

async function apiDelete(endpoint) {
    return apiRequest(endpoint, {
        method: "DELETE"
    });
}