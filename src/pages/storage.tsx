import { Storage } from '@ionic/storage-angular';

export class StorageService {
    private storage: Storage | null = null;

    constructor() {
        this.init();
    }

    async init() {
        const storage = new Storage();
        await storage.create();
        this.storage = storage;
    }

    async setObject(key: string, object: Object) {
        // console.log(`Setting object with key ${key}:`, object); 
        await this.storage?.set(key, object);
    }

    async getObject(key: string) {
        const object = await this.storage?.get(key);
        return object;
    }

    async removeItem(key: string) {
        await this.storage?.remove(key);
    }

    async keys() {
        const keys = await this.storage?.keys();
        return keys;
    }

    async clear() {
        await this.storage?.clear();
    }
}

const storageService = new StorageService();
export default storageService;
