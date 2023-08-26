class StorageService {
  setObject(key: string, object: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, JSON.stringify(object));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getObject<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          resolve(JSON.parse(storedData) as T);
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new StorageService();
