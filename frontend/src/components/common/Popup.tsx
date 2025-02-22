import { useEffect, useRef } from "react";
import { Transition, TransitionStatus } from "react-transition-group";

import { Modal } from "@mui/joy";

import { useUpdatingRef } from "@/utils/hooks";

const getOpacity = (state: TransitionStatus): number =>
  ["entering", "entered"].includes(state) ? 1 : 0;

const getBackdropFilter = (state: TransitionStatus): string =>
  ["entering", "entered"].includes(state) ? "blur(8px)" : "none";

interface PopupProps {
  open?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  hideDuration?: number;
  transitionDuration?: number;
  children: React.ReactElement;
}

const Popup = ({
  open,
  onClose,
  children,
  autoClose,
  hideDuration = 3000,
  transitionDuration = 500,
}: PopupProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useUpdatingRef(onClose);

  const setCloseTimeout = useUpdatingRef(() =>
    setTimeout(() => onCloseRef.current?.(), hideDuration),
  );

  useEffect(() => {
    if (open && autoClose) {
      const id = setCloseTimeout.current?.();
      return () => clearTimeout(id);
    }
  }, [open, autoClose, setCloseTimeout]);

  return (
    <Transition nodeRef={modalRef} in={open} timeout={transitionDuration}>
      {(state) => (
        <Modal
          ref={modalRef}
          keepMounted
          open
          onClose={onClose}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: getOpacity(state),
            backdropFilter: getBackdropFilter(state),
            transition: `
              opacity ${transitionDuration}ms ease-in-out,
              backdrop-filter ${transitionDuration}ms ease-in-out
            `,
            visibility: state === "exited" ? "hidden" : "visible",
          }}
        >
          {children}
        </Modal>
      )}
    </Transition>
  );
};

export default Popup;
