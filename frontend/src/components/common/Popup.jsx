import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { Transition } from "react-transition-group";

import { Modal } from "@mui/joy";

import { useUpdatingRef } from "~/utils/hooks";

const Popup = ({
  open,
  onClose,
  children,
  autoClose,
  hideDuration = 3000,
  transitionDuration = 500,
}) => {
  const modalRef = useRef();
  const onCloseRef = useUpdatingRef(onClose);

  const setCloseTimeout = useUpdatingRef(() => {
    setTimeout(() => onCloseRef.current?.(), hideDuration);
  });

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
            opacity: 0,
            backdropFilter: "none",
            transition: `
              opacity ${transitionDuration}ms ease-in-out,
              backdrop-filter ${transitionDuration}ms ease-in-out
            `,
            ...{
              entering: { opacity: 1, backdropFilter: "blur(8px)" },
              entered: { opacity: 1, backdropFilter: "blur(8px)" },
              exiting: { opacity: 0 },
              exited: { opacity: 0 },
            }[state],
            visibility: state === "exited" ? "hidden" : "visible",
          }}
        >
          {children}
        </Modal>
      )}
    </Transition>
  );
};

Popup.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  autoClose: PropTypes.bool,
  hideDuration: PropTypes.number,
  transitionDuration: PropTypes.number,
  children: PropTypes.node,
};

export default Popup;
