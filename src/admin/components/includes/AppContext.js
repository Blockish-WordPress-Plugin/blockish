import { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [prepareReports, setPrepareReports] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false); // To prevent immediate triggering of the refresh
  const [resetQuery, setResetQuery] = useState(false); // New state to check if reset

  /*
  * This function is used to trigger the refresh of the page
  const triggerRefresh = () => {
      setRefreshKey(prevKey => prevKey + 1);
  };
  */
  const triggerRefresh = () => {
    if (!isWaiting) {
      setIsWaiting(true);
      setRefreshKey(prevKey => prevKey + 1);

      setTimeout(() => {
        setIsWaiting(false);
      }, 2000); // 20 seconds delay
    }
  };

  const triggerRefPrepareReports = (reports, queue_remaining) => {
    setPrepareReports(reports, queue_remaining);
  };

  const triggerResetQuery = () => {
    setResetQuery(true);
    setTimeout(() => {
      setResetQuery(false);
    }, 5000); // Reset after 5 seconds
  };

  return (
    <AppContext.Provider value={{ refreshKey, triggerRefresh, prepareReports, triggerRefPrepareReports, resetQuery, triggerResetQuery }}>
      {children}
    </AppContext.Provider>
  );
};
