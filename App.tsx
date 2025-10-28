

import React, { useReducer, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { rideReducer, initialState } from './state/reducer';
import { useRide } from './hooks/useRide';
import { useWakeLock } from './hooks/useWakeLock';

import MeterDisplay from './components/MeterDisplay';
import ControlButton from './components/ControlButton';
import FloatingMeter from './components/FloatingMeter';
import { PowerIcon, StopIcon, ArrowPathIcon, ExclamationTriangleIcon, MapPinIcon, ArrowsPointingOutIcon } from './components/Icons';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(rideReducer, initialState);
  const [isFloating, setIsFloating] = useState(false);
  const [isPipAvailable, setIsPipAvailable] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipRoot, setPipRoot] = useState<HTMLElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    setIsPipAvailable('documentPictureInPicture' in window);
  }, []);

  // Custom hooks for side effects
  useRide(dispatch, state.phase);
  useWakeLock(state.phase);

  const handleStart = () => dispatch({ type: 'START_RIDE' });
  const handleStop = () => dispatch({ type: 'STOP_RIDE' });
  const handleReset = () => dispatch({ type: 'RESET_RIDE' });

  const handleTogglePip = async () => {
    if (pipWindow) {
      pipWindow.close();
      return;
    }

    if (isPipAvailable) {
      try {
        // FIX: Cast window to `any` to access the experimental `documentPictureInPicture` API.
        // Its type definition may not be available in the default TypeScript DOM library.
        // A runtime check ensures this is only called when the API is available.
        const newPipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 380,
          height: 200,
        });

        // Copy styles
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            newPipWindow.document.head.appendChild(style);
          } catch (e) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media.mediaText;
            link.href = styleSheet.href!;
            newPipWindow.document.head.appendChild(link);
          }
        });

        const mountPoint = newPipWindow.document.createElement('div');
        mountPoint.id = 'pip-root';
        newPipWindow.document.body.appendChild(mountPoint);
        newPipWindow.document.body.style.margin = '0';
        newPipWindow.document.body.style.height = '100vh';
        mountPoint.style.height = '100%';


        setPipRoot(mountPoint);
        setPipWindow(newPipWindow);
        pipWindowRef.current = newPipWindow;

        newPipWindow.addEventListener('pagehide', () => {
          setPipRoot(null);
          setPipWindow(null);
          pipWindowRef.current = null;
        });
      } catch (error) {
        console.error("PiP Error:", error);
      }
    }
  };
  
  const isMeterObscured = (isFloating && state.phase === 'running') || !!pipWindow;

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30">
      
      {isFloating && state.phase === 'running' && (
        <FloatingMeter rideState={state} onClose={() => setIsFloating(false)} />
      )}
      
      {pipRoot && pipWindow && ReactDOM.createPortal(
          <div className="bg-gray-800 p-4 h-full flex items-center justify-center">
             <MeterDisplay 
                distance={state.distance}
                timeInSeconds={state.elapsedTime}
                fare={state.fare}
                status={state.phase}
              />
          </div>,
          pipRoot
      )}

      <div className={`w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700 flex flex-col transition-opacity duration-300 ${isMeterObscured ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <header className="text-center mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-cyan-400 tracking-wider font-orbitron">Repido Meter</h1>
          <div className="flex items-center space-x-4">
            {isPipAvailable && (
              <button 
                onClick={handleTogglePip}
                disabled={state.phase !== 'running'}
                className="text-gray-400 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                aria-label="Open in Picture-in-Picture"
                title="Open in Picture-in-Picture"
                >
                  <ArrowsPointingOutIcon className="h-7 w-7"/>
              </button>
            )}
            <button 
              onClick={() => setIsFloating(true)} 
              disabled={state.phase !== 'running'}
              className="text-gray-400 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              aria-label="Show floating meter"
              title="Show floating meter"
              >
                <MapPinIcon className="h-7 w-7"/>
            </button>
          </div>
        </header>

        <main className="flex-grow">
          <MeterDisplay 
            distance={state.distance}
            timeInSeconds={state.elapsedTime}
            fare={state.fare}
            status={state.phase}
          />

          {state.error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative my-4 text-sm flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-3"/>
              <span>{state.error}</span>
            </div>
          )}

        </main>

        <footer className="mt-6">
          <div className="grid grid-cols-3 gap-4">
            <ControlButton onClick={handleStart} disabled={state.phase === 'running'} variant="start">
              <PowerIcon className="h-6 w-6 mr-2" />
              Start
            </ControlButton>
            <ControlButton onClick={handleStop} disabled={state.phase !== 'running'} variant="stop">
              <StopIcon className="h-6 w-6 mr-2" />
              Stop
            </ControlButton>
            <ControlButton onClick={handleReset} disabled={state.phase === 'running'} variant="reset">
              <ArrowPathIcon className="h-6 w-6 mr-2" />
              Reset
            </ControlButton>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">created by Yash K Pathak</p>
        </footer>
      </div>
    </div>
  );
};

export default App;