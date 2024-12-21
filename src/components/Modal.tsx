import React from 'react';

// import { IconButton } from 'components/atoms/IconButton';
// import { Portal } from 'components/atoms/Portal';

interface IProps {
  header: string | null | undefined;
  handleClose: () => void | null; 
  children: React.ReactNode;
}

export default function Modal(props: IProps) {
  React.useEffect(() => {
    hideDocumentBody();
    return () => {
      showDocumentBody();
    };
  }, []);

  const escFunction = React.useCallback(
    (e: any) => {
      if (e.key === 'Escape' && props.handleClose) {
        props.handleClose();
      }
    },
    [props]
  );

  React.useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  function getBody() {
    return (
      <>
        <div className={`w-[650px] max-w-[90vw] ${!props.header ? 'max-w-full bg-transparent border-transparent' : 'bg-white border border-gray-200'} rounded-lg mx-auto my-5`}>
          {props.header && (
            <div className="h-[65px] w-full flex justify-between items-center px-5">
              <div className="max-w-[75%] flex items-center">
                <p className="text-gray-900 text-lg font-bold font-sans whitespace-nowrap overflow-hidden text-ellipsis mt-[2.5px] mb-0">
                  {props.header}
                </p>
              </div>
              {props.handleClose && (
                <div className="pt-[2.5px]">
                  {/* <IconButton
                    type={'primary'}
                    warning
                    src={'close'}
                    handlePress={() => props.handleClose()}
                    active={false}
                    dimensions={{
                      wrapper: 35,
                      icon: 20,
                    }}
                    tooltip={'Close'}
                    useBottomToolTip
                  /> */}
                </div>
              )}
            </div>
          )}
          <div className="max-h-[calc(100dvh-100px)] w-full overflow-y-auto scrollbar-none">
            {props.children}
          </div>
        </div>
      </>
    );
  }

  return (
    // <Portal node={'overlay'}>
      <div className={`min-h-screen h-full w-full fixed z-[15] top-0 left-0 bg-black/50 backdrop-blur-[2.5px] animate-fadeIn`} style={{top: window ? (window as any).pageYOffset : 0}}>
        {getBody()}
      </div>
    // </Portal>
  );
}

let modalOpenCounter = 0;

const showDocumentBody = () => {
  modalOpenCounter -= 1;
  if (modalOpenCounter === 0) {
    document.body.style.overflow = 'auto';
  }
};

const hideDocumentBody = () => {
  modalOpenCounter += 1;
  document.body.style.overflow = 'hidden';
};
