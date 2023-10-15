import { 
          IonContent, IonHeader, IonPage, IonTitle, 
          IonToolbar, IonButton } from '@ionic/react';
import './settings.css';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import DatabaseService from './DatabaseService';
import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import { Share } from '@capacitor/share';


const Settings: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null); 

  const downloadBackup = async () => {
    const csv = await DatabaseService.exportDataToCSV();
    if (window.Capacitor && window.Capacitor.isNative) {
      // Native device
      try {
        const fileName = 'backup.csv';
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csv,
          directory: Directory.Cache,  // Use Cache directory for temporary files
          encoding: Encoding.UTF8,
        });
        
        await Share.share({
          title: 'Punnote Backup Backup',
          text: 'Here is the backup of the data.',
          url: result.uri,  // This is the path to the saved CSV file
          dialogTitle: 'Share your backup or save it elsewhere',
        });
  
      } catch (e) {
        alert(`Unable to complete backup: ${e.message}`);
      }
    } else {
      // Web browser
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, 'backup.csv');
    }
  };

  const handleRestore = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      setRestoreStatus('Uploading...');
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csv = e.target?.result as string;
          setRestoreStatus('Parsing...');
          await DatabaseService.restoreDataFromCSV(csv); 
          setRestoreStatus('Data restored successfully!');
        } catch (error) {
          setRestoreStatus(`Error: ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="container">
          <h2>Backup and Restore (IN PROGRESS)</h2>
            <p>Export your data to a CSV file.</p>
              <IonButton 
                onClick={downloadBackup} 
                className='settingsButtons'
                >
                  Backup Data
                </IonButton>
            <p>Restore your data from a CSV file.</p>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className='hidden'
            onChange={handleFileChange}
          />
          <div className='rowContainer'>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className='hidden'
            onChange={handleFileChange}
          />
          <div className='rowContainer'>
            <IonButton 
              onClick={triggerFileInput} 
              className='settingsButtons'
            >
              {selectedFileName || 'Select File'}
            </IonButton>
            <IonButton 
              onClick={handleRestore} 
              className='settingsButtons'
              color='warning'
              disabled={!selectedFileName} 
            >
              Restore Data
            </IonButton>
          </div>
        </div>
        <div className='statusLine'>
          {restoreStatus && <p>{restoreStatus}</p>} 
        </div>

        <h3>Stats!</h3>
          <p>To Do</p>          
        <h3>About</h3>
          <p>Punnote is an app. Duh. Use it for any performance. IDC. Do what you want.</p>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
