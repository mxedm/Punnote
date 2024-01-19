import {  IonContent, IonHeader, IonItem, IonIcon, 
          IonInput, IonPage, IonTitle, IonList, IonToolbar, 
          IonButton, IonToast, IonButtons, IonToggle, IonCard, 
          IonCardContent, IonCardHeader, IonCardTitle, IonAlert } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService, { Bit } from './DatabaseService';
import { useHistory, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import './bitList.css';
import './standard.css';
import { timeOutline, filterCircleOutline } from 'ionicons/icons';

const bitList: React.FC = () => {
  const [bits, setBits] = useState<Bit[]>([]);
  const [bitTitle, setBitTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [bitToast, setBitToast] = useState(false);
  const [bitToDelete, setBitToDelete] = useState<number | null>(null);
  const [bitArchived, setBitArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const debouncedSetSearchTerm = debounce((value: React.SetStateAction<string>) => setSearchTerm(value), 300); 
  const history = useHistory();
  const location = useLocation();

  const [sortCycle, setSortCycle] = useState(0); 
  const [sortField, setSortField] = useState('title'); 


  useEffect(() => {
    const fetchBits = async () => {
      const fetchedBits = await DatabaseService.getBits();
      setBits(fetchedBits);
    };
    fetchBits();
  }, [location.pathname]);

  const filteredBits = bits.filter(bit => {
    return (
      ((bit.title && bit.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bit.content && bit.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bit.notes && bit.notes.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (bitArchived ? true : !bit.archive)
    );
  });

  const sortBits = () => {
    let nextSortField = sortField;
    let nextSortAscending = sortAscending;
  
    // Update sort field and order based on the current cycle
    switch (sortCycle) {
      case 0:
        nextSortField = 'title';
        nextSortAscending = true;
        break;
      case 1:
        nextSortField = 'title';
        nextSortAscending = false;
        break;
      case 2:
        nextSortField = 'created';
        nextSortAscending = true;
        break;
      case 3:
        nextSortField = 'created';
        nextSortAscending = false;
        break;
      case 4:
        nextSortField = 'modified';
        nextSortAscending = true;
        break;
      case 5:
        nextSortField = 'modified';
        nextSortAscending = false;
        break;
      default:
        // Reset the cycle
        nextSortField = 'title';
        nextSortAscending = true;
        setSortCycle(0);
        return;
    }
  
    const sortedBits = [...filteredBits].sort((a, b) => {
      const valueA = a[nextSortField];
      const valueB = b[nextSortField];
  
      if (nextSortField === 'title') {
        return nextSortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        if (valueA < valueB) {
          return nextSortAscending ? -1 : 1;
        }
        if (valueA > valueB) {
          return nextSortAscending ? 1 : -1;
        }
        return 0;
      }
    });
  
    setBits(sortedBits);
    setSortField(nextSortField);
    setSortAscending(nextSortAscending);
    setSortCycle(sortCycle + 1);
  };
  
  const deleteBit = async (id: number) => {
    await DatabaseService.removeBit(id);
    setBits(bits => bits.filter(bit => bit.id !== id));
    setBitToDelete(null);
  };

  const handleAddBit = (title: string) => {
    if (isAdding) return;
    setIsAdding(true);   
    if (title.length === 0) {
      setToastMessage('Please enter a bit title');
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
      content: '',
      notes: '',
      length: 0,
      rating: 0,
      archive: false
    };
    await DatabaseService.addBit(newBit as Bit);
    setBits(prevBits => [newBit as Bit, ...prevBits]); 
    setBitTitle('');
  }

  const editBit = (id: number) => {
    history.push(`/BitEdit/${id}`);
  };

  const formatLength = (length: number) => {
    const minutes = Math.floor(length / 60);
    const seconds = length % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle className='titleText'>Bits</IonTitle>
        <IonButtons slot='end' className='toggleArchiveButton'>
          <span className='archiveLabel'>List Archived</span>
          <IonToggle 
            checked={bitArchived} 
            onIonChange={e => setBitArchived(e.detail.checked)} 
          />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen>
      <div className='inputRow'>
        <div className='inputWrapper'>
          <div className='customItem'>
            <label className='inputLabel'>Bit Name</label>
            <input
              aria-label='Bit Name'
              className='inputText inputTextListing inlineTextInput'
              placeholder='Enter New Bit Name Here'
              value={bitTitle}
              onChange={e => setBitTitle(e.target.value)}
            />
          </div>
        </div>
        <IonButton
          type='submit'
          className='addButton inlineButton'
          disabled={isLoading || bitTitle.trim() === ''} 
          onClick={() => handleAddBit(bitTitle)}
        >
          {isLoading ? <IonIcon icon={timeOutline} /> : 'add'} 
        </IonButton>
      </div>
      <IonItem className='searchBox'>
        <IonInput
          type='text'
          placeholder='Search...'
          value={searchTerm}
          onIonInput={e => debouncedSetSearchTerm((e.target as unknown as HTMLInputElement).value)} 
        />
        Sort ({sortField}):
        <IonItem>
          <IonIcon 
            className='sortIcon'
            icon={filterCircleOutline}
            style={{ transform: sortAscending ? 'none' : 'rotate(180deg)' }}
            onClick={sortBits}></IonIcon>
        </IonItem>
      </IonItem>
      <IonList className='mainList'>
        {filteredBits.map(bit => (
          <IonCard key={bit.id}>
            <IonCardHeader>
              <IonCardTitle>{bit.title} {bit.length > 0 ? '(' + formatLength(bit.length) + ')' : ''   }</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {bit.content && (
                <span className='bitCardContentParagraph'>
                  {bit.content.length > 60 ? bit.content.substr(0, 60) + '...' : bit.content}
                </span>
              )}
              <div className='rowContainer cardContainer'>
                <IonButton
                  className=''
                  fill='solid'
                  color='primary'
                  onClick={() => editBit(bit.id)}
                >
                edit
                </IonButton>
                <IonButton
                  className=''
                  color='danger'
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
