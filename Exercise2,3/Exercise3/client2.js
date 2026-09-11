import axios from "axios";

async function fetchData() {
  try {
    const response = await axios.get("http://localhost:3000");
    console.log(`[Axios Client] Status Code: ${response.status}`);
    console.log(`[Axios Client] Data nhận được: ${response.data}`);
  } catch (error) {
    console.error("[Axios Client] Gặp lỗi:", error.message);
  }
}

fetchData();
