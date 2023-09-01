import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, useIonToast, useIonViewWillEnter,
  IonPage, IonModal, IonTitle, IonToolbar, IonList,
  IonReorderGroup, IonReorder, ItemReorderEventDetail,
  IonItem, IonInput, IonButton, IonIcon
} from '@ionic/react';
import { closeCircle } from 'ionicons/icons';
import './setlistEdit.css';
import './standard.css';
import { useParams, useHistory } from 'react-router-dom';
import DatabaseService, { Setlist } from './DatabaseService';
import { SetlistItem, Bit } from './DatabaseService';

const SetlistEdit: React.FC = () => {

  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [setlistItems, setSetlistItems] = useState<SetlistItem[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [bits, setBits] = useState<Bit[]>([]);
  const [showBitList, setShowBitList] = useState(false);
  const [title, setTitle] = useState('');
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [presentToast] = useIonToast();

  useEffect(() => {
    fetchBits();
    fetchSetlistItems();
    fetchSetlist();
  }, [id]);

  useIonViewWillEnter(() => {
    fetchBits();
    fetchSetlistItems();
    fetchSetlist();
  }, [bits]);

  const fetchBits = async () => {
    const fetchedBits = await DatabaseService.getBits();
    setBits(fetchedBits);
  };

  const fetchSetlistItems = async () => {
    const allSetlistItems = await DatabaseService.getSetlistItems();
    const filteredItems = allSetlistItems.filter(item => item.setlistID === Number(id));
    setSetlistItems(filteredItems);
  };

  const fetchSetlist = async () => {
    const fetchedSetlist = await DatabaseService.getSetlist(Number(id));
    setSetlist(fetchedSetlist);
  };

  const handleReorder = async (event: CustomEvent<ItemReorderEventDetail>) => {
    const items = setlistItems.slice();
    const from = event.detail.from;
    const to = event.detail.to;
    items.splice(to, 0, items.splice(from, 1)[0]);
    setSetlistItems(items);
    event.detail.complete();
    for (let i = 0; i < items.length; i++) {
      await DatabaseService.updateSetlistItemOrder(items[i].id, i + 1);
    }
  };

  const handleBitSelection = async (bit: Bit) => {
    await addBitToSetlist(bit);
    setShowBitList(false);
  };

  const addBitToSetlist = async (bit: Bit) => {
    const maxOrder = setlistItems.reduce((max, item) => Math.max(max, item.order), 0);
    const newItem: SetlistItem = {
      order: maxOrder + 1,
      bitID: bit.id,
      setlistID: Number(id),
      isPlaintext: false,
    };
    await DatabaseService.addSetlistItem(newItem);
    fetchSetlistItems();
  };

  const addPlaintextItem = async () => {
    if (inputValue.trim().length === 0) {
      presentToast({
        message: 'Please enter at least one letter or number.',
        duration: 2000,
        color: 'danger'
      });
      return;
    }
    const maxOrder = setlistItems.reduce((max, item) => Math.max(max, item.order), 0);
    const newItem: SetlistItem = {
      order: maxOrder + 1,
      plaintext: inputValue,
      setlistID: Number(id),
      isPlaintext: true,
      length: 0,
      archive: false,
    };
    await DatabaseService.addSetlistItem(newItem);
    setInputValue('');
    fetchSetlistItems();
  };

  const removeSetlistItem = async (itemId: number) => {
    await DatabaseService.removeSetlistItem(itemId);
    fetchSetlistItems();
  };

  const totalLength = setlistItems.reduce((total, item) => {
    const correspondingBit = bits.find(bit => bit.id === item.bitID);
    return total + (Number(correspondingBit?.length) || 0);
  }, 0);

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const goToSetlistPlay = () => {
    history.push(`/SetlistPlay/${id}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{setlist?.title || 'Setlist Edit' } ({formatTime(totalLength)})</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className='editWindow'>

          <div className="inputWrapper">
            <div className="customItem">
              <label className="inputLabel">Title:</label>
              <input
                aria-label="Title"
                className="inputText"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>

          <IonList>
            <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
            {setlistItems.sort((a, b) => a.order - b.order).map((item, index) => {
              if (item.isPlaintext) {
                return (
                  <IonItem key={index} className='setlistTextItem'>
                    <IonButton onClick={() => removeSetlistItem(item.id)} color="danger" className='removeButton' shape='round'>
                    <IonIcon icon={closeCircle} />
                    </IonButton>
                    [ {item.plaintext}]
                    <IonReorder slot="end" />
                  </IonItem>
                );
              }
              const correspondingBit = bits.find(bit => bit.id === item.bitID);
              return (
                <IonItem key={index}>
                  <IonButton onClick={() => removeSetlistItem(item.id)} color="danger" className='removeButton' shape='round'>
                    <IonIcon icon={closeCircle} />
                  </IonButton>
                    {correspondingBit?.title || "No title found"} ({isNaN(correspondingBit?.length) ? "N/A" : formatTime(correspondingBit?.length)})
                  <IonReorder slot="end" />
                </IonItem>
              );
            })}
            </IonReorderGroup>
          </IonList>
          <div className="rowContainer">
            <IonInput value={inputValue} placeholder="Insert freeform text" onIonChange={e => setInputValue(e.detail.value!)} />
            <IonButton onClick={addPlaintextItem} shape="round">
              Insert
            </IonButton>
          </div>
          <IonList>
          <IonModal isOpen={showBitList} onDidDismiss={() => setShowBitList(false)}>
            <IonList>
              <IonItem>
                <strong>Click to Add:</strong>
              </IonItem>
              {bits
                .filter(bit => !setlistItems.some(item => item.bitID === bit.id) && bit.archive !== true)
                .map((bit, index) => {
                  return (
                    <IonItem key={index} onClick={() => handleBitSelection(bit)}>
                      {bit.title}
                    </IonItem>
                  );
                })
              }
            </IonList>
            <IonButton onClick={() => setShowBitList(false)}>Close Bit List</IonButton>
          </IonModal>
          </IonList>
        </div>
      </IonContent>
      <IonButton shape="round" className="playButton" onClick={goToSetlistPlay}>
        play
      </IonButton>
      <IonButton 
        shape="round" 
        className="newButton" 
        slot='center'
        color={bits.every(bit => setlistItems.some(item => item.bitID === bit.id)) ? "danger" : "primary"} 
        disabled={bits.every(bit => setlistItems.some(item => item.bitID === bit.id))}
        onClick={() => setShowBitList(!showBitList)}>
        insert
      </IonButton>
    </IonPage>
  );
};

export default SetlistEdit;
