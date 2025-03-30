const config = {
    apiPath: "https://minipos-api-1b3a.onrender.com",
    headers: () => {
        return {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        };
    },
};
export default config;