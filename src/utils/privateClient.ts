import axios from "axios";

export const privateClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTI3NjMyNjksInN1YiI6IjEiLCJ0eXBlIjoiYWNjZXNzIn0.cHnGln-zCifvrShuTNmgOFm9bJD2DWcMO-wYCKFQPME"}`,
	},
});
