import * as utils from "./utils.js";
import { Logger } from "staticScripts/Logger.js";
import fetch from "./fetch/index.js";
export class Ollama {
    constructor(config) {
        this.ongoingStreamedRequests = [];
        this.config = {
            host: "",
        };
        if (!config?.proxy) {
            this.config.host = "http://127.0.0.1:11434"; //utils.formatHost(
            // config?.host ?? "http://127.0.0.1:11434"
            //);
        }
        //this.fetch = fetch;
        this.fetch = fetch;
        if (config?.fetch != null) {
            this.fetch = config.fetch;
        }
    }
    // Abort any ongoing streamed requests to Ollama
    abort() {
        for (const request of this.ongoingStreamedRequests) {
            request.abort();
        }
        this.ongoingStreamedRequests.length = 0;
    }
    /**
     * Processes a request to the Ollama server. If the request is streamable, it will return a
     * AbortableAsyncIterator that yields the response messages. Otherwise, it will return the response
     * object.
     * @param endpoint {string} - The endpoint to send the request to.
     * @param request {object} - The request object to send to the endpoint.
     * @protected {T | AbortableAsyncIterator<T>} - The response object or a AbortableAsyncIterator that yields
     * response messages.
     * @throws {Error} - If the response body is missing or if the response is an error.
     * @returns {Promise<T | AbortableAsyncIterator<T>>} - The response object or a AbortableAsyncIterator that yields the streamed response.
     */
    async processStreamableRequest(endpoint, request) {
        request.stream = request.stream ?? false;
        const host = `${this.config.host}/api/${endpoint}`;
        if (request.stream) {
            const abortController = new AbortController();
            const response = await utils.post(this.fetch, host, request, {
                signal: abortController.signal,
            });
            if (!response.body) {
                throw new Error("Missing body");
            }
            const itr = utils.parseJSON(response.body);
            const abortableAsyncIterator = new utils.AbortableAsyncIterator(abortController, itr, () => {
                const i = this.ongoingStreamedRequests.indexOf(abortableAsyncIterator);
                if (i > -1) {
                    this.ongoingStreamedRequests.splice(i, 1);
                }
            });
            this.ongoingStreamedRequests.push(abortableAsyncIterator);
            return abortableAsyncIterator;
        }
        Logger.warn("Sending post", "request ai :)");
        const response = await utils.post(this.fetch, host, request);
        Logger.warn(JSON.stringify(response), "Response");
        return await response.json();
    }
    /**
     * Encodes an image to base64 if it is a Uint8Array.
     * @param image {Uint8Array | string} - The image to encode.
     * @returns {Promise<string>} - The base64 encoded image.
     */
    async encodeImage(image) {
        if (typeof image !== "string") {
            // image is Uint8Array, convert it to base64
            const uint8Array = new Uint8Array(image);
            let byteString = "";
            const len = uint8Array.byteLength;
            for (let i = 0; i < len; i++) {
                byteString += String.fromCharCode(uint8Array[i]);
            }
            return btoa(byteString);
        }
        // the string may be base64 encoded
        return image;
    }
    /**
     * Generates a response from a text prompt.
     * @param request {GenerateRequest} - The request object.
     * @returns {Promise<GenerateResponse | AbortableAsyncIterator<GenerateResponse>>} - The response object or
     * an AbortableAsyncIterator that yields response messages.
     */
    async generate(request) {
        // if (request.images) {
        //  request.images = await Promise.all(
        //   request.images.map(this.encodeImage.bind(this))
        // );
        // }
        Logger.warn("GENERATE REQUEST", "request ai :)");
        return this.processStreamableRequest("generate", request);
    }
    /**
     * Chats with the model. The request object can contain messages with images that are either
     * Uint8Arrays or base64 encoded strings. The images will be base64 encoded before sending the
     * request.
     * @param request {ChatRequest} - The request object.
     * @returns {Promise<ChatResponse | AbortableAsyncIterator<ChatResponse>>} - The response object or an
     * AbortableAsyncIterator that yields response messages.
     */
    async chat(request) {
        if (request.messages) {
            for (const message of request.messages) {
                /*
                if (message.images) {
                  message.images = await Promise.all(
                    message.images.map(this.encodeImage.bind(this))
                  );
                }
                  */
            }
        }
        return this.processStreamableRequest("chat", request);
    }
    /**
     * Creates a new model from a stream of data.
     * @param request {CreateRequest} - The request object.
     * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or a stream of progress responses.
     */
    async create(request) {
        return this.processStreamableRequest("create", {
            name: request.model,
            stream: request.stream,
            modelfile: request.modelfile,
            quantize: request.quantize,
        });
    }
    /**
     * Pulls a model from the Ollama registry. The request object can contain a stream flag to indicate if the
     * response should be streamed.
     * @param request {PullRequest} - The request object.
     * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or
     * an AbortableAsyncIterator that yields response messages.
     */
    async pull(request) {
        return this.processStreamableRequest("pull", {
            name: request.model,
            stream: request.stream,
            insecure: request.insecure,
        });
    }
    /**
     * Pushes a model to the Ollama registry. The request object can contain a stream flag to indicate if the
     * response should be streamed.
     * @param request {PushRequest} - The request object.
     * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or
     * an AbortableAsyncIterator that yields response messages.
     */
    async push(request) {
        return this.processStreamableRequest("push", {
            name: request.model,
            stream: request.stream,
            insecure: request.insecure,
        });
    }
    /**
     * Deletes a model from the server. The request object should contain the name of the model to
     * delete.
     * @param request {DeleteRequest} - The request object.
     * @returns {Promise<StatusResponse>} - The response object.
     */
    async delete(request) {
        await utils.del(this.fetch, `${this.config.host}/api/delete`, {
            name: request.model,
        });
        return { status: "success" };
    }
    /**
     * Copies a model from one name to another. The request object should contain the name of the
     * model to copy and the new name.
     * @param request {CopyRequest} - The request object.
     * @returns {Promise<StatusResponse>} - The response object.
     */
    async copy(request) {
        await utils.post(this.fetch, `${this.config.host}/api/copy`, {
            ...request,
        });
        return { status: "success" };
    }
    /**
     * Lists the models on the server.
     * @returns {Promise<ListResponse>} - The response object.
     * @throws {Error} - If the response body is missing.
     */
    async list() {
        const response = await utils.get(this.fetch, `${this.config.host}/api/tags`);
        return (await response.json());
    }
    /**
     * Shows the metadata of a model. The request object should contain the name of the model.
     * @param request {ShowRequest} - The request object.
     * @returns {Promise<ShowResponse>} - The response object.
     */
    async show(request) {
        const response = await utils.post(this.fetch, `${this.config.host}/api/show`, {
            ...request,
        });
        return (await response.json());
    }
    /**
     * Embeds text input into vectors.
     * @param request {EmbedRequest} - The request object.
     * @returns {Promise<EmbedResponse>} - The response object.
     */
    async embed(request) {
        const response = await utils.post(this.fetch, `${this.config.host}/api/embed`, {
            ...request,
        });
        return (await response.json());
    }
    /**
     * Embeds a text prompt into a vector.
     * @param request {EmbeddingsRequest} - The request object.
     * @returns {Promise<EmbeddingsResponse>} - The response object.
     */
    async embeddings(request) {
        const response = await utils.post(this.fetch, `${this.config.host}/api/embeddings`, {
            ...request,
        });
        return (await response.json());
    }
    /**
     * Lists the running models on the server
     * @returns {Promise<ListResponse>} - The response object.
     * @throws {Error} - If the response body is missing.
     */
    async ps() {
        const response = await utils.get(this.fetch, `${this.config.host}/api/ps`);
        return (await response.json());
    }
}
export default new Ollama();
// export all types from the main entry point so that packages importing types dont need to specify paths
export * from "./interfaces.js";
