async createOrder(tableId, customerCount) {
  try {
    const response = await axios.post(
      `${this.baseUrl}/orders/${tableId}/create/`,
      {
        table: tableId,
        customer_count: customerCount
      },
      {
        headers: {
          'X-PIN': this.pin,
          'X-CSRFTOKEN': this.csrfToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
} 