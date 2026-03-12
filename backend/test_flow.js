import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

async function testFlow() {
    const baseUrl = "http://localhost:5005/api";

    try {
        // 1. Register/Login
        console.log("Logging in...");
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test@example.com", password: "password123" })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.log("Login failed, trying to register...");
            const regRes = await fetch(`${baseUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Test User", email: "test@example.com", password: "password123" })
            });
            const regData = await regRes.json();
            if (!regRes.ok) throw new Error("Auth failed: " + JSON.stringify(regData));
            var token = regData.token;
        } else {
            var token = loginData.token;
        }

        console.log("Token obtained.");

        // 2. Create a chat
        console.log("Creating chat...");
        const chatRes = await fetch(`${baseUrl}/chat/new`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const chatData = await chatRes.json();
        const chatId = chatData._id;
        console.log("Chat created:", chatId);

        // 3. Upload a file
        console.log("Uploading file...");
        const form = new FormData();
        const testFilePath = "./test_file.txt";
        fs.writeFileSync(testFilePath, "This is some test content about a mysterious planet called Kynara.");
        form.append("file", fs.createReadStream(testFilePath));

        const uploadRes = await fetch(`${baseUrl}/upload`, {
            method: "POST",
            headers: {
                ...form.getHeaders(),
                "Authorization": `Bearer ${token}`
            },
            body: form
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error("Upload failed: " + JSON.stringify(uploadData));
        console.log("Upload Success:", uploadData.fileUrl);

        // 4. Send Message with Attachment
        console.log("Sending message with attachment...");
        const sendRes = await fetch(`${baseUrl}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message: "What is mentioned in the attached file?",
                chatId: chatId,
                persona: "balanced",
                attachments: [{
                    url: uploadData.fileUrl,
                    name: "test_file.txt",
                    fileType: "text/plain"
                }]
            })
        });
        const sendData = await sendRes.json();
        if (!sendRes.ok) throw new Error("Send Message failed: " + JSON.stringify(sendData));

        console.log("AI Response:", sendData.reply);

    } catch (error) {
        console.error("Test Flow Error:", error.message);
    }
}

testFlow();
