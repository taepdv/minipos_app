const config = {
    apiPath: "http://localhost:3004",
    headers: () => {
        return {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        };
    },
};
export default config;