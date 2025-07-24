import axios from "axios";
import { errorAlert } from "./alert";

const handleAxiosError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") {
      // Do not log canceled requests
      return;
    }

    console.error("Axios error:", error.message);
    if (error.response) {
      // Server responded with a status other than 200 range
      const errorMessage =
        (error.response.data as { result?: { message: string } })?.result
          ?.message || "An error occurred";
      errorAlert(errorMessage);
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // Request was made but no response was received
      console.error("Request data:", error.request);
      errorAlert("Request failed. Please try again later.");
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
    }
  } else {
    // Handle non-Axios errors
    console.error("Non-Axios error:", error);
  }
};

export default handleAxiosError;
