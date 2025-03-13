module.exports = {
    mode: "jit",
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                aggrid: {
                    tulsi: "red",
                    background: "#1F2937",
                    header: "#1F2937",
                    text: "#E5E7EB",
                    border: "#374151",
                    hover: "#374151",
                    headertext: "#ced1d7",
                    pagination: "#1F2937",
                    "pagination-text": "#ffffff",
                },
            },
        },
    },
    plugins: [],
};
