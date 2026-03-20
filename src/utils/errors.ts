export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    if (maybeResponse.response?.data?.message) {
      return maybeResponse.response.data.message;
    }

    if (maybeResponse.message) {
      return maybeResponse.message;
    }
  }

  return fallback;
}
