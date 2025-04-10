import { version } from './version.js';
/**
 * An error class for response errors.
 * @extends Error
 */
class ResponseError extends Error {
    constructor(error, status_code) {
        super(error);
        this.error = error;
        this.status_code = status_code;
        this.name = 'ResponseError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ResponseError);
        }
    }
}
/**
 * An AsyncIterator which can be aborted
 */
export class AbortableAsyncIterator {
    constructor(abortController, itr, doneCallback) {
        this.abortController = abortController;
        this.itr = itr;
        this.doneCallback = doneCallback;
    }
    abort() {
        this.abortController.abort();
    }
    async *[Symbol.asyncIterator]() {
        for await (const message of this.itr) {
            if ('error' in message) {
                throw new Error(message.error);
            }
            yield message;
            // message will be done in the case of chat and generate
            // message will be success in the case of a progress response (pull, push, create)
            if (message.done || message.status === 'success') {
                this.doneCallback();
                return;
            }
        }
        throw new Error('Did not receive done or success response in stream.');
    }
}
/**
 * Checks if the response is ok, if not throws an error.
 * If the response is not ok, it will try to parse the response as JSON and use the error field as the error message.
 * @param response {Response} - The response object to check
 */
const checkOk = async (response) => {
    if (response.ok) {
        return;
    }
    let message = `Error ${response.status}: ${response.statusText}`;
    let errorData = null;
    if (response.headers.get('content-type')?.includes('application/json')) {
        try {
            errorData = (await response.json());
            message = errorData.error || message;
        }
        catch (error) {
            console.log('Failed to parse error response as JSON');
        }
    }
    else {
        try {
            console.log('Getting text from response');
            const textResponse = await response.text();
            message = textResponse || message;
        }
        catch (error) {
            console.log('Failed to get text from error response');
        }
    }
    throw new ResponseError(message, response.status);
};
/**
 * Returns the platform string based on the environment.
 * @returns {string} - The platform string
 */
function getPlatform() {
    if (typeof window !== 'undefined' && window.navigator) {
        return `${window.navigator.platform.toLowerCase()} Browser/${navigator.userAgent};`;
    }
    else if (typeof process !== 'undefined') {
        return `${process.arch} ${process.platform} Node.js/${process.version}`;
    }
    return ''; // unknown
}
/**
 * A wrapper around fetch that adds default headers.
 * @param fetch {Fetch} - The fetch function to use
 * @param url {string} - The URL to fetch
 * @param options {RequestInit} - The fetch options
 * @returns {Promise<Response>} - The fetch response
 */
const fetchWithHeaders = async (fetch, url, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': `ollama-js/${version} (${getPlatform()})`,
    };
    if (!options.headers) {
        options.headers = {};
    }
    options.headers = {
        ...defaultHeaders,
        ...options.headers,
    };
    return fetch(url, options);
};
/**
 * A wrapper around the get method that adds default headers.
 * @param fetch {Fetch} - The fetch function to use
 * @param host {string} - The host to fetch
 * @returns {Promise<Response>} - The fetch response
 */
export const get = async (fetch, host) => {
    const response = await fetchWithHeaders(fetch, host);
    await checkOk(response);
    return response;
};
/**
 * A wrapper around the head method that adds default headers.
 * @param fetch {Fetch} - The fetch function to use
 * @param host {string} - The host to fetch
 * @returns {Promise<Response>} - The fetch response
 */
export const head = async (fetch, host) => {
    const response = await fetchWithHeaders(fetch, host, {
        method: 'HEAD',
    });
    await checkOk(response);
    return response;
};
/**
 * A wrapper around the post method that adds default headers.
 * @param fetch {Fetch} - The fetch function to use
 * @param host {string} - The host to fetch
 * @param data {Record<string, unknown> | BodyInit} - The data to send
 * @param options {{ signal: AbortSignal }} - The fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const post = async (fetch, host, data, options) => {
    const isRecord = (input) => {
        return input !== null && typeof input === 'object' && !Array.isArray(input);
    };
    const formattedData = isRecord(data) ? JSON.stringify(data) : data;
    const response = await fetchWithHeaders(fetch, host, {
        method: 'POST',
        body: formattedData,
        signal: options?.signal,
    });
    await checkOk(response);
    return response;
};
/**
 * A wrapper around the delete method that adds default headers.
 * @param fetch {Fetch} - The fetch function to use
 * @param host {string} - The host to fetch
 * @param data {Record<string, unknown>} - The data to send
 * @returns {Promise<Response>} - The fetch response
 */
export const del = async (fetch, host, data) => {
    const response = await fetchWithHeaders(fetch, host, {
        method: 'DELETE',
        body: JSON.stringify(data),
    });
    await checkOk(response);
    return response;
};
/**
 * Parses a ReadableStream of Uint8Array into JSON objects.
 * @param itr {ReadableStream<Uint8Array>} - The stream to parse
 * @returns {AsyncGenerator<T>} - The parsed JSON objects
 */
export const parseJSON = async function* (itr) {
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    const reader = itr.getReader();
    while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(chunk);
        const parts = buffer.split('\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
            try {
                yield JSON.parse(part);
            }
            catch (error) {
                console.warn('invalid json: ', part);
            }
        }
    }
    for (const part of buffer.split('\n').filter((p) => p !== '')) {
        try {
            yield JSON.parse(part);
        }
        catch (error) {
            console.warn('invalid json: ', part);
        }
    }
};
/**
 * Formats the host string to include the protocol and port.
 * @param host {string} - The host string to format
 * @returns {string} - The formatted host string
 */
export const formatHost = (host) => {
    if (!host) {
        return 'http://127.0.0.1:11434';
    }
    let isExplicitProtocol = host.includes('://');
    if (host.startsWith(':')) {
        // if host starts with ':', prepend the default hostname
        host = `http://127.0.0.1${host}`;
        isExplicitProtocol = true;
    }
    if (!isExplicitProtocol) {
        host = `http://${host}`;
    }
    const url = new URL(host);
    let port = url.port;
    if (!port) {
        if (!isExplicitProtocol) {
            port = '11434';
        }
        else {
            // Assign default ports based on the protocol
            port = url.protocol === 'https:' ? '443' : '80';
        }
    }
    let formattedHost = `${url.protocol}//${url.hostname}:${port}${url.pathname}`;
    // remove trailing slashes
    if (formattedHost.endsWith('/')) {
        formattedHost = formattedHost.slice(0, -1);
    }
    return formattedHost;
};
