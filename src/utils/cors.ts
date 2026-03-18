export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function handlePreflight(requestMethod: string) {
  if (requestMethod === "OPTIONS") {
    return {
      status: 204,
      headers: corsHeaders,
    };
  }
  return null;
}