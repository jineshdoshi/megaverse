import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const maxRetries = 5; // Maximum number of retries
const baseDelayInMilliseconds = 1000; // Base delay in milliseconds

/**
 * Performs an Axios request with exponential backoff retry logic.
 * @param method The HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param url The URL for the request.
 * @param config The Axios request configuration.
 * @returns A promise that resolves with the response data.
 */
export async function axiosRetryRequestWithExponentialBackoff<T>(
    method: string,
    url: string,
    config?: AxiosRequestConfig
): Promise<T> {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            // Perform the Axios request
            const response: AxiosResponse<T> = await axios.request<T>({
                method,
                url,
                ...config
            });
            return response.data;
        } catch (error) {
            // Check if the error is a 429 status (rate limit exceeded)
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                // Calculate the exponential delay
                const delay = baseDelayInMilliseconds * 2 ** retries;
                console.log(`Retry ${retries + 1}: Waiting for ${delay} milliseconds`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Wait for the calculated delay
                retries++; // Increment the retry count
            } else {
                // For other errors, rethrow the error
                throw Error('Request failed!');
            }
        }
    }

    // If max retries reached without success, throw an error
    throw new Error(`Request failed after ${maxRetries} retries`);
}
