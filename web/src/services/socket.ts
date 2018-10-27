import uuid from 'uuid/v4';

export type Handler = (message: any) => void;

export class Socket {
    private socket: WebSocket|undefined;
    private handlers: Map<string, Handler[]> = new Map();
    private callHandlers: Map<string, (message: any) => void> = new Map();
    private connected: boolean = false;
    private connecting: boolean = false;
    private connectionPromise: Promise<boolean>|null = null;

    public connect() {
        if (this.connected || this.connecting) {
            return this.connectionPromise;
        }

        this.connecting = true;
        this.connectionPromise = new Promise((resolve, reject) => {
            this.socket = new WebSocket('ws://localhost:8080/ws');
            this.socket.addEventListener('open', () => {
                this.connected = true;
                this.connecting = false;
                resolve(true);
            });

            this.socket.addEventListener('error', this.onError.bind(this));

            this.socket.addEventListener('message', (event: MessageEvent) => {
                this.onMessage(event.data);
            });
        });

        return this.connectionPromise;
    }

    public addHandler(type: string, handler: Handler): () => void  {
        // Try and connect first. Don't need to wait for response.
        this.connect();

        let handlers: Handler[] = [];

        if (this.handlers.has(type)) {
            handlers = this.handlers.get(type)!;
        }

        handlers.push(handler);
        this.handlers.set(type, handlers);

        return () => {
            handlers.splice(handlers.indexOf(handler), 1);
        };
    }

    public once(type: string, handler: Handler) {
        const remove = this.addHandler(type, (message) => {
            handler(message);
            remove();
        });
    }

    public async call(
        endpoint: string,
        payload?: Record<string, any>|boolean|string|any[]|number,
    ): Promise<Record<string, any>> {
        await this.connect();
        const id = uuid();

        this.socket!.send(JSON.stringify({
            id,
            endpoint,
            payload,
        }));

        return new Promise((resolve) => {
            this.callHandlers.set(id, resolve);
        });
    }

    public emit(type: string, message: any) {
        const handlers = this.handlers.get(type);

        if (!handlers || handlers.length === 0) {
            return;
        }

        handlers.forEach((handler) => {
            try {
                handler(message);
            } catch (error) {
                console.error('Error in handler', handler);
                console.error(error);
            }
        });
    }

    public onMessage(message: string) {
        try {
            const data = JSON.parse(message);

            if (data.type) {
                this.emit(data.type, data.payload);
            }

            if (data.id) {
                if (!this.callHandlers.has(data.id)) {
                    return;
                }

                this.callHandlers.get(data.id)!(data.payload);
                this.callHandlers.delete(data.id);
            }
        } catch (e) {
            console.error(e);
        }
    }

    public onError(error: Error) {
        this.connected = false;
        console.error(error);
    }
}

export const socket = new Socket();
