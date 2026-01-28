import React, { useEffect, useRef, useState } from "react";
import styles from "./StaffRoles.module.css";


type Props = {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

const StaffActions: React.FC<Props> = ({ onView, onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className={styles.wrapper} ref={ref}>
            <button className={styles.trigger} onClick={() => setOpen(!open)}>
                ⋮
            </button>

            {open && (
                <div className={styles.menu}>
                    <button onClick={onView}>View</button>
                    <button onClick={onEdit}>Edit</button>
                    <button className={styles.delete} onClick={onDelete}>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default StaffActions;
