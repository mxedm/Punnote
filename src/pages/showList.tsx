import {  IonContent, IonHeader, IonPage, IonTitle,
  IonList, IonToolbar, IonButton, IonToast, IonButtons, 
  IonToggle, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonAlert, IonIcon, IonItem, IonInput } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import DatabaseService, { Show } from './DatabaseService';
import { useHistory } from 'react-router-dom';
import { debounce } from 'lodash';
import './showList.css';
import './standard.css';
import { filterCircleOutline, timeOutline } from 'ionicons/icons';

const showList: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);;
  const [showTitle, setShowTitle] = useState("");
  const [showToDelete, setShowToDelete] = useState<number | null>(null); 
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); 
  const [isAddingShow, setIsAddingShow] = useState(false);
  const [showToast, setShowToast] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const history = useHistory();
  const [sortAscending, setSortAscending] = useState(true);
  const debouncedSetSearchTerm = debounce((value: React.SetStateAction<string>) => setSearchTerm(value), 300); // 300ms delay

  const now = new Date();
  const showDateToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0); 

  useEffect(() => {
    const fetchShows = async () => {
      const fetchedShows = await DatabaseService.getShows();
      setShows(fetchedShows);
    };
    fetchShows();
  }, [location.pathname]);

  const filteredShows = shows.filter(show => {
    return (
      (show.title && show.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortShows = () => {
    const currentSortOrder = sortAscending; 
    setSortAscending(!currentSortOrder); 
    const sortedShows = [...filteredShows].sort((a, b) => {
      if (currentSortOrder) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setShows(sortedShows);
  };

  const deleteShow = async (id: number) => {
    await DatabaseService.removeShow(id);
    setShows(bits => shows.filter(show => show.id !== id));
    setShowToDelete(null);
  };

  const handleAddShow = (title: string) => {
    if (isAddingShow) return;
    setIsAddingShow(true); 
    if (title.length === 0) {
      setToastMessage("Please enter a show title");
      setShowToast(true); 
      setIsAddingShow(false);
      return;
    } else {
      setIsLoading(true); 
      addShow(title).then(() => { 
        setIsLoading(false); 
        setIsAddingShow(false); 
      });
    }
  };

  const addShow = async (title: string) => {
    const newShow: Partial<Show> = {
      id: Date.now(),
      title: title,
      venue: "",
      notes: "",
      showdate: showDateToday,
      setlength: 0,
      compensation: 0,
      mediaurl: "",
      type: "",
      setlistID: 0,
      rating: 0, 
      archive: false,
    };
    await DatabaseService.addShow(newShow as Show);
    setShows(prevShows => [newShow as Show, ...prevShows]); 
    // setShows(prevShows => [...prevShows, newShow as Show]);
    setShowTitle("");
  };  

  const editShow = (id: number) => {
    history.push(`/showEdit/${id}`);
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="titleText">Shows</IonTitle>
          <IonButtons slot="end" className="toggleArchiveButton">
            <span className="archiveLabel">Archived</span>
            <IonToggle 
              checked={showArchived} 
              onIonChange={e => setShowArchived(e.detail.checked)} 
            />
          </IonButtons>

        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="inputRow">
          <div className="inputWrapper">
            <div className="customItem">
              <label className="inputLabel">Show Name</label>
              <input
                aria-label="Show Name"
                className="inputText inputTextListing"
                placeholder="Enter Show Name Here"
                value={showTitle}
                onChange={e => setShowTitle(e.target.value)}
              />
            </div>
          </div>

          <IonButton
            type="submit"
            className="addButton"
            disabled={isLoading || showTitle.trim() === ''} 
            onClick={() => handleAddShow(showTitle)}
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
            icon={filterCircleOutline}
            style={{ transform: sortAscending ? 'none' : 'rotate(180deg)' }}
            onClick={sortShows}></IonIcon>
          </IonItem>
        </IonItem>

        <IonList class="mainList">
        {filteredShows.map(show => (
            <IonCard key={show.id}>
              <IonCardHeader>
                <IonCardTitle>
                  {show.title} 
                  {show.venue ? ` at ${show.venue}` : ''}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
              <p>When:&nbsp;
                {
                  show.showdate && !isNaN(new Date(show.showdate).getTime()) 
                  ? `${new Date(show.showdate).toLocaleDateString()} ${new Date(show.showdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                  : "No data."
                }</p>
          <div className="rowContainer cardContainer">
                  <IonButton 
                    fill="solid"
                    color="primary"
                    slot=""
                    onClick={() => editShow(show.id)}
                  >
                    edit
                  </IonButton>
                  <IonButton 
                      className=""
                      color="danger"
                      onClick={() => setShowToDelete(show.id)} 
                      >
                      delete
                    </IonButton>                
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>

        <IonAlert
          isOpen={showToDelete !== null}
          header={'Delete Show'}
          message={'Are you sure you want to delete this show? This action cannot be undone.'}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => setShowToDelete(null) 
            },
            {
              text: 'Confirm',
              handler: () => showToDelete !== null && deleteShow(showToDelete) 
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

export default showList;
