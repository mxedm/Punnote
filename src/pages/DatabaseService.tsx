import StorageService from './StorageService';
import Papa from 'papaparse';

export interface Bit {
  id: number;
  title: string;
  content: string;
  notes: string;
  length: number;
  rating: number;
  archive: boolean;
  created: Date;
  modified: Date;
  revision: number;
}

export interface SetlistItem {
  id: number;
  order: number;
  bitID?: number;
  plaintext: string;
  setlistID: number;
  isPlaintext: boolean;
}

export interface Setlist {
  id: number;
  title: string;
  goalLength?: number;
  archive: boolean;
  created: Date;
  modified: Date;
  revision: number;
}

export interface Show {
  id: number;
  title: string;
  venue: string;
  notes: string;
  showdate: Date;
  setlength: number;
  compensation: number;
  mediaurl: string;
  type: string;
  setlistID: number;
  rating: number;
  archive: boolean;
  created: Date;
  modified: Date;
  revision: number;
}

class DatabaseService {

  private refreshListeners: Array<() => void> = [];

  async getBits(): Promise<Bit[]> {
    return await StorageService.getObject('bits') || [];
  }

  addRefreshListener(listener: () => void) {
    this.refreshListeners.push(listener);
  }

  removeRefreshListener(listener: () => void) {
    this.refreshListeners = this.refreshListeners.filter(l => l !== listener);
  }

  updateBits = async (bits: Bit[]): Promise<void> => {
    await StorageService.setObject('bits', bits);
  };

  updateSetlists = async (setlists: Setlist[]): Promise<void> => {
    await StorageService.setObject('setlists', setlists);
  };

  updateSetlistItems = async (setlistItems: SetlistItem[]): Promise<void> => {
    await StorageService.setObject('setlistItems', setlistItems);
  };

  updateShows = async (shows: Show[]): Promise<void> => {
    await StorageService.setObject('shows', shows);
  };

  exportDataToCSV = async (): Promise<string> => {
    const bits = await this.getBits();
    const setlists = await this.getSetlists(); 
    const setlistItems = await this.getSetlistItems();
    const shows = await this.getShows();

    const convertDate = (date) => {
      return date instanceof Date ? date.toISOString() : date;
    };

    const mapBit = (bit: Bit) => ({
      id: bit.id,
      title: bit.title,
      content: bit.content,
      notes: bit.notes,
      length: bit.length,
      rating: bit.rating,
      archive: bit.archive,
      created: convertDate(bit.created),
      modified: convertDate(bit.modified),
      revision: bit.revision,
      type: 'bit'
    });
  
    const mapSetlistItem = (item: SetlistItem) => ({
      id: item.id,
      order: item.order,
      bitID: item.bitID,
      plaintext: item.plaintext,
      setlistID: item.setlistID,
      isPlaintext: item.isPlaintext,
      type: 'setlistItem'
    });
  
    const mapSetlist = (setlist: Setlist) => ({
      id: setlist.id,
      title: setlist.title,
      goalLength: setlist.goalLength,
      archive: setlist.archive,
      created: convertDate(setlist.created),
      modified: convertDate(setlist.modified),
      revision: setlist.revision,
      type: 'setlist'
    });
  
    const mapShow = (show: Show) => ({
      id: show.id,
      title: show.title,
      venue: show.venue,
      notes: show.notes,
      showdate: convertDate(show.showdate),
      setlength: show.setlength,
      compensation: show.compensation,
      mediaurl: show.mediaurl,
      type: 'show',
      setlistID: show.setlistID,
      rating: show.rating,
      archive: show.archive,
      created: convertDate(show.created),
      modified: convertDate(show.modified),
      revision: show.revision
    });
  
    const allData = [
      ...bits.map(mapBit),
      ...setlists.map(mapSetlist),
      ...setlistItems.map(mapSetlistItem),
      ...shows.map(mapShow)
    ];
  
    const csv = Papa.unparse(allData, {
      columns: ["id", "title", "content", "notes", "length", "rating", "archive", 
                "created", "modified", "revision", "type", "order", "bitID", "plaintext", 
                "setlistID", "isPlaintext", "goalLength", "venue", "showdate", 
                "setlength", "compensation", "mediaurl", "type"]
    });
    return csv;
  };  

  restoreDataFromCSV = async (csv: string): Promise<void> => {
    const parsedData = Papa.parse(csv, { header: true, dynamicTyping: true });
  
    const bits = parsedData.data.filter((item: any) => item.type === 'bit');
    const setlists = parsedData.data.filter((item: any) => item.type === 'setlist');
    const setlistItems = parsedData.data.filter((item: any) => item.type === 'setlistItem');
    const shows = parsedData.data.filter((item: any) => item.type === 'show');
  
    await this.updateBits(bits);
    await this.updateSetlists(setlists);
    await this.updateSetlistItems(setlistItems);
    await this.updateShows(shows);
  };
  
  async refresh() {
    this.refreshListeners.forEach(listener => listener());
  }

  async deleteALL() {
    await StorageService.setObject('bits', []);
    await StorageService.setObject('setlists', []);
    await StorageService.setObject('setlistItems', []);
    await StorageService.setObject('shows', []);
  }

  async addBit(bit: Bit): Promise<void> {
    const bits = await this.getBits();
    const existingBitIndex = bits.findIndex(b => b.id === bit.id);
    if (existingBitIndex !== -1) {
      bits[existingBitIndex] = bit; 
    } else {
      bit.archive = false;
      bit.created = new Date();
      bit.modified = new Date();
      bit.revision = 0;
      bits.push(bit); 
    }
    await StorageService.setObject('bits', bits);
  }

  async addSetlist(setlist: Setlist): Promise<void> {
    const setlists = await this.getSetlists();
    const existingSetlistIndex = setlists.findIndex(s => s.id === setlist.id);
    if (existingSetlistIndex !== -1) {
      setlists[existingSetlistIndex] = setlist; 
    } else {
      setlist.archive = false;
      setlist.created = new Date();
      setlist.modified = new Date();
      setlist.goalLength = 0;
      setlist.revision = 0;
      setlists.push(setlist); 
    }
    await StorageService.setObject('setlists', setlists);
  }
  
  async addShow(show: Show): Promise<void> {
    const shows = await this.getShows();
    const existingShowIndex = shows.findIndex(s => s.id === show.id);
    if (existingShowIndex !== -1) {
      shows[existingShowIndex] = show; 
    } else {
      show.archive = false;
      show.created = new Date();
      show.modified = new Date();
      show.revision = 0;
      shows.push(show); 
    }
    await StorageService.setObject('shows', shows);
  }

  async addSetlistItem(setlistItem: SetlistItem): Promise<void> {
    const setlistItems = await this.getSetlistItems();
    const existingItemIndex = setlistItems.findIndex(item => item.id === setlistItem.id);
    if (existingItemIndex !== -1) {
      setlistItems[existingItemIndex] = setlistItem;
    } else {
      const newId = setlistItems.length > 0 ? Math.max(...setlistItems.map(item => item.id)) + 1 : 1;
      setlistItem.id = newId; 
      setlistItems.push(setlistItem); 
    }
    await StorageService.setObject('setlistItems', setlistItems);
  }

  async getBit(id: number): Promise<Bit | null> {
    if (id === 0) {
      return null;
    }
    const bits: Bit[] = await this.getBits();
    const bit = bits.find(b => b.id === id);
    if (!bit) {
      return null;
    }
    return bit;
  }

  async getSetlist(id: number): Promise<Setlist> {
    const setlists: Setlist[] = await this.getSetlists();
    const setlist = setlists.find(s => s.id === id);
    if (!setlist) {
      throw new Error(`Setlist with id ${id} not found`);
    }
    return setlist;
  }

  async getSetlists(): Promise<Setlist[]> {
    return await StorageService.getObject('setlists') || [];
  }

  async getSetlistItems(): Promise<SetlistItem[]> {
    return await StorageService.getObject('setlistItems') || [];
  }

  async getShows(): Promise<Show[]> {
    return await StorageService.getObject('shows') || [];
  }

  async removeSetlist(id: number): Promise<void> {
    let setlists = await this.getSetlists();
    setlists = setlists.filter(setlist => setlist.id !== id);
    await StorageService.setObject('setlists', setlists);
    let setlistItems = await this.getSetlistItems();
    setlistItems = setlistItems.filter(item => item.setlistID !== id);
    await StorageService.setObject('setlistItems', setlistItems);
  }

  async removeBit(bitId: number): Promise<void> {
    let bits = await this.getBits();
    bits = bits.filter(bit => bit.id !== bitId);
    await StorageService.setObject('bits', bits);
    let setlistItems = await this.getSetlistItems();
    setlistItems = setlistItems.filter(item => item.bitId !== bitId);
    await StorageService.setObject('setlistItems', setlistItems);
  }

  async removeShow(showId: number): Promise<void> {
    let shows = await this.getShows();
    shows = shows.filter(show => show.id !== showId);
    await StorageService.setObject('shows', shows);
  }

  async removeSetlistItem(itemId: number): Promise<void> {
    let setlistItems = await this.getSetlistItems();
    setlistItems = setlistItems.filter(item => item.id !== itemId);
    await StorageService.setObject('setlistItems', setlistItems);
  }
 
  async editBit(bitToEdit: Bit): Promise<void> {
    const bits = await this.getBits();
    bitToEdit.modified = new Date();
    bitToEdit.revision += 1;

    const bitIndex = bits.findIndex(bit => bit.id === bitToEdit.id);
    if (bitIndex === -1) {
      throw new Error(`Bit with id ${bitToEdit.id} not found`);
    }
    bits[bitIndex] = bitToEdit; 
    await StorageService.setObject('bits', bits);
  }

  async editSetlist(setlistToEdit: Setlist): Promise<void> {
    const setlists = await this.getSetlists();
    setlistToEdit.modified = new Date();
    setlistToEdit.revision += 1;

    const setlistIndex = setlists.findIndex(setlist => setlist.id === setlistToEdit.id);
    if (setlistIndex === -1) {
      throw new Error(`Setlist with id ${setlistToEdit.id} not found`);
    }
    setlists[setlistIndex] = setlistToEdit; 
    await StorageService.setObject('setlists', setlists);
  }

  async editShow(showToEdit: Show): Promise<void> {
    const shows = await this.getShows();
    showToEdit.modified = new Date();
    showToEdit.revision += 1;

    const showIndex = shows.findIndex(show => show.id === showToEdit.id);
    if (showIndex === -1) {
      throw new Error(`Show with id ${showToEdit.id} not found`);
    }
    shows[showIndex] = showToEdit; 
    await StorageService.setObject('shows', shows);
  }
  
  async updateSetlistItemOrder(itemId: number, newOrder: number): Promise<void> {
    const setlistItems = await this.getSetlistItems();
    const itemIndex = setlistItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`SetlistItem with id ${itemId} not found`);
    }
    setlistItems[itemIndex].order = newOrder;
    await StorageService.setObject('setlistItems', setlistItems);
  }

  async updateSetlistItem(itemToUpdate: SetlistItem): Promise<void> {
    // console.log('updateSetlistItem', itemToUpdate);
    const setlists = await this.getSetlists();
    const setlist = setlists.find(s => s.id === itemToUpdate.setlistId);

    if (!setlist) {
      throw new Error(`Setlist with id ${itemToUpdate.setlistId} not found`);
    }
    const items = setlist.items ?? [];
    const itemIndex = items.findIndex(item => item.id === itemToUpdate.id);

    if (itemIndex === -1) {
      throw new Error(`SetlistItem with id ${itemToUpdate.id} not found in Setlist ${itemToUpdate.setlistId}`);
    }
    items[itemIndex] = itemToUpdate;
    setlist.items = items;
    await this.editSetlist(setlist);
  }
}

export default new DatabaseService();