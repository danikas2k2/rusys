import { memo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: ReactNode;
}

const getModalRoot = (): HTMLElement => {
    let bindTo = document.getElementById('modal-root');
    if (!bindTo) {
        bindTo = document.createElement('div');
        bindTo.id = 'modal-root';
        document.body.appendChild(bindTo);
    }
    return bindTo;
};

export default memo(function Portal({ children }: PortalProps): JSX.Element {
    const modalRoot = getModalRoot();
    return createPortal(children, modalRoot);
});
