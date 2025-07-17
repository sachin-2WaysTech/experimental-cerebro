import axios from "axios";

export const privateClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTI3NjEwOTYsInN1YiI6IjEiLCJ0eXBlIjoiYWNjZXNzIn0.e_wG2YY7W1wBDDmoVTJTn57RwWbXL1unCOlC1AVheIg"}`,
	},
});
