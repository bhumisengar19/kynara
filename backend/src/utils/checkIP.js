import fetch from "node-fetch";
const checkIP = async () => {
    try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        console.log("External IP:", data.ip);
    } catch (e) {
        console.error("IP Check failed", e);
    }
};
checkIP();
