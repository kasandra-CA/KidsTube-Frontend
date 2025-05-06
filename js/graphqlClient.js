// graphqlClient.js
export async function graphqlRequest(query, variables = {}) {
    const token = localStorage.getItem("token");
  
    const response = await fetch("http://localhost:3008/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    });
  
    const result = await response.json();
  
    if (result.errors) {
      console.error("❌ GraphQL Error:", result.errors);
      throw new Error(result.errors[0].message);
    }
  
    return result.data;
  }  