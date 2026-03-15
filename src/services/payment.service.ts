import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

export const paymentService = {
  async createCheckoutSession(subscriptionId: string) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/payments/create-checkout-session`,
      { subscriptionId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
};
