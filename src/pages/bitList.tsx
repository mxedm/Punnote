import {  IonContent, IonHeader, IonItem, IonIcon, 
          IonInput, IonPage, IonTitle, 
          IonList, IonToolbar, IonButton, IonToast, 
          IonButtons, IonToggle, IonCard, IonCardContent, 
          IonCardHeader, IonCardTitle, 
          IonAlert } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService, { Bit } from './DatabaseService';
import { useHistory, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import './bitList.css';
import './standard.css';
import { timeOutline, filterCircleOutline } from 'ionicons/icons';

const bitList: React.FC = () => {
  const [bits, setBits] = useState<Bit[]>([]);
  const [bitTitle, setBitTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [bitToast, setBitToast] = useState(false);
  const [bitToDelete, setBitToDelete] = useState<number | null>(null);
  const [bitArchived, setBitArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [sortField, setSortField] = useState<string>("created"); 
  const [sortOrder, setSortOrder] = useState<string>("asc"); 

  const debouncedSetSearchTerm = debounce((value: React.SetStateAction<string>) => setSearchTerm(value), 300); // 300ms delay

  const history = useHistory();
  const location = useLocation();
  
  useEffect(() => {
    const fetchBits = async () => {
      const fetchedBits = await DatabaseService.getBits();
      setBits(fetchedBits);
    };
    fetchBits();
  }, [location.pathname]);

  const filteredBits = bits.filter(bit => {
    return (
      (bit.title && bit.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bit.content && bit.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bit.notes && bit.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  const deleteBit = async (id: number) => {
    await DatabaseService.removeBit(id);
    setBits(bits => bits.filter(bit => bit.id !== id));
    setBitToDelete(null);
  };

  const handleAddBit = (title: string) => {
     if (isAdding) return;
  
    setIsAdding(true);   
    if (title.length === 0) {
      setToastMessage("Please enter a bit title");
      setBitToast(true);
      setIsAdding(false);
      return;
    } else {
      setIsLoading(true); 
      addBit(title).then(() => {
        setIsLoading(false); 
        setIsAdding(false); 
      });
    }
  };

  const addBit = async (title: string) => {
    const newBit: Partial<Bit> = {
      id: Date.now(),
      title: title,
      content: "",
      notes: "",
      length: 0,
      rating: 0,
      archive: false
    };
    await DatabaseService.addBit(newBit as Bit);
    setBits(prevBits => [...prevBits, newBit as Bit]);
    setBitTitle("");
  }

  const editBit = (id: number) => {
    history.push(`/BitEdit/${id}`);
  };
  
  const formatLength = (length: number) => {
    const minutes = Math.floor(length / 60);
    const seconds = length % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle the sort order if the same field is clicked again
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If a different field is clicked, set it as the new sorting field
      setSortField(field);
      setSortOrder("asc"); // Default to ascending order
    }
  };

  const sortedBits = filteredBits.slice().sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (fieldA === fieldB) return 0;

    if (sortOrder === "asc") {
      return fieldA < fieldB ? -1 : 1;
    } else {
      return fieldA > fieldB ? -1 : 1;
    }
  });

  return (
  <IonPage>

    <IonHeader>
      <IonToolbar>
        <IonTitle slot="start">Bits</IonTitle>
        <IonButtons slot="end" className="toggleArchiveButton">
          <span className="archiveLabel">List Archived</span>
          <IonToggle 
            checked={bitArchived} 
            onIonChange={e => setBitArchived(e.detail.checked)} 
          />
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen>

      
      <div className="inputRow">
        <div className="inputWrapper">
          <div className="customItem">
            <label className="inputLabel">Bit Name</label>
            <input
              aria-label="Bit Name"
              className="inputText inputTextListing"
              placeholder="Enter New Bit Name Here"
              value={bitTitle}
              onChange={e => setBitTitle(e.target.value)}
            />
          </div>
        </div>
        <IonButton
          type="submit"
          className="addButton"
          disabled={isLoading || bitTitle.trim() === ''} 
          onClick={() => handleAddBit(bitTitle)}
        >
          {isLoading ? <IonIcon icon={timeOutline} /> : "Add"} 
        </IonButton>
      </div>

      <IonItem className='searchBox'>
        <IonInput
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onIonInput={e => debouncedSetSearchTerm((e.target as HTMLInputElement).value)} 
        />
        <IonItem>
          <IonIcon 
            className=""
            icon={filterCircleOutline}></IonIcon>
        </IonItem>
      </IonItem>

      <IonList className='mainList'>
        {sortedBits.map(bit => (
          <IonCard key={bit.id}>
            <IonCardHeader>
              <IonCardTitle>{bit.title} {bit.length > 0 ? "(" + formatLength(bit.length) + ")" : ""   }</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {bit.content && (
                <span className="bitCardContentParagraph">
                  {bit.content.length > 60 ? bit.content.substr(0, 60) + "..." : bit.content}
                </span>
              )}
              <div className="rowContainer cardContainer">
                <IonButton
                  className=""
                  fill="solid"
                  color="primary"
                  onClick={() => editBit(bit.id)}
                >
                edit
                </IonButton>
                <IonButton
                  className=""
                  color="danger"
                  onClick={() => setBitToDelete(bit.id)} 
                >
                delete
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </IonList>


      <IonAlert
        isOpen={bitToDelete !== null}
        header={'Delete Bit'}
        message={'Are you sure you want to delete this bit? This action cannot be undone.'}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => setBitToDelete(null) 
          },
          {
            text: 'Confirm',
            handler: () => bitToDelete !== null && deleteBit(bitToDelete) 
          }
        ]}
      />

      <IonToast
        isOpen={bitToast}
        onDidDismiss={() => setBitToast(false)}
        message={toastMessage}
        duration={2000}
      />
    </IonContent>
  </IonPage>
  );
};

export default bitList;
