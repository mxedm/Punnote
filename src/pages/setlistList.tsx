import {  IonContent, IonHeader, IonPage, IonTitle, IonList, 
          IonToolbar, IonButton, IonToast, IonCard, IonCardHeader, 
          IonCardTitle, IonCardContent, IonAlert, IonIcon,
          IonInput, IonItem } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService, { Setlist } from './DatabaseService';
import { debounce } from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import './setlistList.css';
import './standard.css';
import { timeOutline, filterCircleOutline } from 'ionicons/icons';

const setlistList: React.FC = () => {

  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [setlistTitle, setSetlistTitle] = useState("");
  const [toastMessage, setToastMessage] = useState(""); 
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [setlistToDelete, setSetlistToDelete] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSetlist, setIsAddingSetlist] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAscending, setSortAscending] = useState(true);

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const fetchSetlists = async () => {
      const fetchedSetlists = await DatabaseService.getSetlists();
      setSetlists(fetchedSetlists);
    };
    fetchSetlists();
  }, [location.pathname]);

  const debouncedSetSearchTerm = debounce((value: string) => setSearchTerm(value), 300);

  const sortSetlists = () => {
    setSortAscending(!sortAscending);
    const sortedSetlists = [...setlists].sort((a, b) => {
      if (sortAscending) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setSetlists(sortedSetlists);
  };

  const filteredSetlists = setlists.filter(setlist => {
    return setlist.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedSetlists = filteredSetlists.sort((a, b) => {
    if (sortAscending) {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  const deleteSetlist = (id: number) => {
    setSetlistToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleDeleteSetlist = async () => {
    if (setlistToDelete !== null) {
      await DatabaseService.removeSetlist(setlistToDelete);
      setSetlists(prevSetlists => prevSetlists.filter(setlist => setlist.id !== setlistToDelete));
    }
    setShowDeleteAlert(false);
  };

  const handleAddSetlist = (title: string) => {
    if (isAddingSetlist) return;
    setIsAddingSetlist(true); 
    if (title.length === 0) {
      setToastMessage("Please enter a setlist title");
      setShowToast(true); 
      setIsAddingSetlist(false); 
      return;
    } else {
      setIsLoading(true);
      addSetlist(title).then(() => {
        setIsLoading(false); 
        setIsAddingSetlist(false); 
      });
    }
  };

  const addSetlist = async (title: string) => {
    const newSetlist: Partial<Setlist> = {
      id: Date.now(),
      title: title,
      archive: false,
    };
    await DatabaseService.addSetlist(newSetlist as Setlist);
    setSetlists(prevSetlists => [...prevSetlists, newSetlist as Setlist]);
    setSetlistTitle("");
  };

  const editSetlist = (id: number) => {
    history.push(`/SetlistEdit/${id}`);
  };

  return (
    <IonPage>
      <IonHeader>
      <IonToolbar>
        <IonTitle className="titleText">Setlists</IonTitle>
      </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="inputRow">
          <div className="inputWrapper">
            <div className="customItem">
              <label className="inputLabel">Setlist Name</label>
              <input
                aria-label="Setlist Name"
                className="inputText inputTextListing"
                placeholder="Enter Setlist Name Here"
                value={setlistTitle}
                onChange={e => setSetlistTitle(e.target.value)}
              />
            </div>
          </div>
          <IonButton
            type="submit"
            className="addButton"
            disabled={isLoading || setlistTitle.trim() === ''} 
            onClick={() => handleAddSetlist(setlistTitle)}
          >
            {isLoading ? <IonIcon icon={ timeOutline } /> : "Add"} 
          </IonButton>
        </div>
        <IonItem className='searchBox'>
          <IonInput
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onIonInput={e => debouncedSetSearchTerm((e.target as unknown as HTMLInputElement).value)} 
          />
          Sort: 
          <IonItem>
            <IonIcon 
              className="sortIcon"
              style={{ transform: sortAscending ? 'none' : 'rotate(180deg)' }}
              icon={filterCircleOutline}
              onClick={sortSetlists}></IonIcon>
          </IonItem>
        </IonItem>

        <IonList class="mainList">
          {setlists.slice().reverse().map(setlist => (
            <IonCard key={setlist.id}>
              <IonCardHeader>
                <IonCardTitle>
                  {setlist.title}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
              <div className="rowContainer cardContainer">
                <IonButton 
                  className=""
                  color="primary"
                  slot="end"
                  onClick={() => editSetlist(setlist.id)}
                >
                  Edit
                </IonButton>
                <IonButton 
                  className=""
                  color="danger"
                  onClick={() => deleteSetlist(setlist.id)} 
                  >
                  delete
                </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>

        <IonAlert
            isOpen={showDeleteAlert}
            onDidDismiss={() => setShowDeleteAlert(false)}
            header={'Confirm Delete'}
            message={'Are you sure you want to delete this setlist?'}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  setShowDeleteAlert(false);
                }
              },
              {
                text: 'Yes, Delete',
                handler: handleDeleteSetlist
              }
            ]}
          />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default setlistList;