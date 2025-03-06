import { createRoot } from 'react-dom/client';
// const { render } = wp.element;

/**
 * Import the stylesheet for the plugin.
 */
import './style/_import.css';
import './style/_override.scss';
import './style/app.scss';

import { AppProvider } from './components/includes/AppContext';
import Dashboard from './Dashboard';


/**
 * Render the App component into the DOM
 */
if (document.getElementById('blockish')) {
  const App = () => {
    return (
      <>
        <h2 className='app-title'></h2>
        <Dashboard />
      </>
    );
  }

  ReactDOM.render(
    <AppProvider>
      <App />
    </AppProvider>
    , document.getElementById('blockish'));
}
