
import { useEffect, useRef, useState } from "react";
import configSettings from "../../config.json";

interface IIdlePopup {
  show?: boolean;
  onClose: (isLogout: boolean) => void;
}

const IdlePopup = ({ show, onClose }: IIdlePopup) => {
  const [time, setTime] = useState(configSettings.idlePopupDuration);
  const mounted = useRef(0);

  useEffect(() => {
    if (show) {
      if (time <= 1) {
        if (mounted.current) {
          window.clearTimeout(mounted.current);
        }
        onClose(true);
        return;
      }
      mounted.current = window.setTimeout(() => setTime(time - 1),1000);
    } else {
      setTime(configSettings.idlePopupDuration);
    }
    return () => {
      if (mounted.current) {
        window.clearTimeout(mounted.current);
      }
    };
  }, [show, time]);

  return (
    <div className={`top-modal ${show ? "is-active" : ""}`}>
      <div className="top-modal-content">
          You've been idle for a while.  You'll be logged out in {time} secs, unless you're still there!
      </div>
      <div className="top-modal-buttons">
        <button className="button" onClick={() => onClose(false)}>
          I'm still here!
        </button>
        <button className="button is-danger" onClick={() => onClose(true)}>
          Logout
        </button>
      </div>
    </div>
  );
};
export default IdlePopup;
